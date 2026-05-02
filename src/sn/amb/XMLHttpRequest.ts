/* eslint-disable @typescript-eslint/ban-types */
/*
 * Copyright (c) 2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as httpc from "node:http";
import * as https from "node:https";
import * as httpcProxyAgent from "http-proxy-agent";
import * as httpsProxyAgent from "https-proxy-agent";


interface XMLHTTPRequestOptions {
	httpProxy?: { uri: any; includes?: RegExp[]; excludes?:  RegExp[]; };
	cookies?: { storeCookie: (arg0: { hostname: string; }, arg1: string, arg2: () => void) => void; retrieveCookies: (arg0: any, arg1: any, arg2: any) => void; };
	globalCookies?: { [x: string]: {}; };
	logLevel?: string;

}

// Bare minimum XMLHttpRequest implementation that works with CometD.
export class XMLHttpRequest {
	static UNSENT = 0;
	static OPENED = 1;
	static HEADERS_RECEIVED = 2;
	static LOADING = 3;
	static DONE = 4;

	// Fields shared by all XMLHttpRequest instances.
	private agentOptions = {
		keepAlive: true
	};
	private agentc = new httpc.Agent(this.agentOptions);
	private agents = new https.Agent(this.agentOptions);

	#options: XMLHTTPRequestOptions;
	#localCookies: { [host: string]: { [key: string]: string } } = {};
	#config;
	#request?: httpc.ClientRequest;
	#readyState = XMLHttpRequest.UNSENT;
	#responseText = "";
	#status: number | undefined = 0;
	#statusText: string | undefined = "";
	onload;
	onerror;
	context;

	constructor(options: XMLHTTPRequestOptions = {}) {
		this.#options = options;
	}

	get readyState() {
		return this.#readyState;
	}

	get responseText() {
		return this.#responseText;
	}

	get status() {
		return this.#status;
	}

	get statusText() {
		return this.#statusText;
	}

	open(method, uri) {
		this.#config = uri instanceof URL ? uri : new URL(uri);
		this.#config.agent = this.chooseAgent(this.#config);
		this.#config.method = method;
		this.#config.headers = {};
		this.#readyState = XMLHttpRequest.OPENED;
	}

	setRequestHeader(name, value) {
		if (/^cookie$/i.test(name)) {
			this.storeCookie(value);
		} else {
			this.#config.headers[name] = value;
		}
	}

	send(data?) {
		this.retrieveServerCookies(this.context, this.#config, (x, cookies) => {
			const cookies1 = x ? "" : cookies.join("; ");
			const cookies2 = this.retrieveCookies().join("; ");
			const delim = (cookies1 && cookies2) ? "; " : "";
			const allCookies = cookies1 + delim + cookies2;
			if (allCookies) {
				this.#config.headers["Cookie"] = allCookies;
			}

			const http = this.secure(this.#config) ? https : httpc;
			this.#request = http.request(this.#config, response => {
				let success = false;
				this.#status = response.statusCode;
				this.#statusText = response.statusMessage;
				this.#readyState = XMLHttpRequest.HEADERS_RECEIVED;
				const setCookies: string[] = [];
				const headers = response.headers;
				for (const name in headers) {
					if (headers.hasOwnProperty(name)) {
						if (/^set-cookie$/i.test(name)) {
							const header = headers[name];
							if (Array.isArray(header)) {
								setCookies.push(...header);
							} else if (typeof header === "string") {
								setCookies.push(header);
							}
						}
					}
				}
				this.asyncForEach(setCookies, 0, (element, callback) => {
					this.storeServerCookie(this.#config, element, callback);
				}, () => {
					response.on("data", chunk => {
						this.#readyState = XMLHttpRequest.LOADING;
						this.#responseText += chunk;
					});
					response.on("end", () => {
						success = true;
						this.#readyState = XMLHttpRequest.DONE;
						if (this.onload) {
							this.onload();
						}
					});
					response.on("close", () => {
						if (!success) {
							this.#readyState = XMLHttpRequest.DONE;
							if (this.onerror) {
								this.onerror();
							}
						}
					});
				});
			});
			["abort", "aborted", "error"].forEach(event => {
				this.#request?.on(event, (x) => {
					this.#readyState = XMLHttpRequest.DONE;
					if (x) {
						const error = x.message;
						if (error) {
							this.#statusText = error;
						}
					}
					if (this.onerror) {
						this.onerror(x);
					}
				});
			});
			if (data) {
				this.#request.write(data);
			}
			this.#request.end();
		});
	}

	abort(): void {
		if (this.#request) {
			this.#request.abort();
		}
	}

	private storeCookie(value) {
		const host = this.#config.hostname;
		let jar = this.#localCookies[host];
		if (jar === undefined) {
			this.#localCookies[host] = jar = {};
		}
		const cookies = value.split(";");
		for (let i = 0; i < cookies.length; ++i) {
			const cookie = cookies[i].trim();
			const equal = cookie.indexOf("=");
			if (equal > 0) {
				jar[cookie.substring(0, equal)] = cookie;
			}
		}
	}

	private retrieveCookies() {
		const cookies: string[] = [];
		const jar = this.#localCookies[this.#config.hostname];
		if (jar) {
			for (const name in jar) {
				if (jar.hasOwnProperty(name)) {
					cookies.push(jar[name]);
				}
			}
		}
		return cookies;
	}

	private chooseAgent(serverURI: { host?: any; href?: any; protocol?: string; }) {
		const serverHostPort = serverURI.host;
		const proxy = this.#options && this.#options.httpProxy && this.#options.httpProxy.uri;
		if (proxy) {
			let isIncluded = true;
			const includes = this.#options.httpProxy?.includes;
			if (includes && Array.isArray(includes)) {
				isIncluded = false;
				for (let i = 0; i < includes.length; ++i) {
					if (new RegExp(includes[i]).test(serverHostPort)) {
						isIncluded = true;
						break;
					}
				}
			}
			if (isIncluded) {
				const excludes = this.#options.httpProxy?.excludes;
				if (excludes && Array.isArray(excludes)) {
					for (let e = 0; e < excludes.length; ++e) {
						if (new RegExp(excludes[e]).test(serverHostPort)) {
							isIncluded = false;
							break;
						}
					}
				}
			}
			if (isIncluded) {
				this.debug("proxying", serverURI.href, "via", proxy);
				const agentOpts = Object.assign({}, this.agentOptions);
				return this.secure(serverURI) ? new httpsProxyAgent.HttpsProxyAgent(proxy, agentOpts as never) : new httpcProxyAgent.HttpProxyAgent(proxy, agentOpts as never);
			}
		}
		return this.secure(serverURI) ? this.agents : this.agentc;
	}

	private storeServerCookie(uri: { hostname: any; }, header: string, callback: () => void) {
		if (this.#options && this.#options.cookies && this.#options.cookies.storeCookie) {
			this.#options.cookies.storeCookie(uri, header, callback);
		} else {
			const host = uri.hostname;
			if (! this.#options.globalCookies)
				 this.#options.globalCookies = {};
			let jar = this.#options.globalCookies[host];
			if (jar === undefined) {
				this.#options.globalCookies[host] = jar = {};
			}
			const parts = header.split(";");
			// Ignore domain, path, expiration, etc.
			const nameValue = parts[0].trim();
			const equal = nameValue.indexOf("=");
			if (equal > 0) {
				const name = nameValue.substring(0, equal);
				jar[name] = nameValue;
			}
			callback();
		}
	}

	private retrieveServerCookies(context: { cookieStore: any; }, uri: { hostname: string | number; }, callback: { (x: any, cookies: any): void; (arg0: null, arg1: any[]): void; }) {
		if (this.#options && this.#options.cookies && this.#options.cookies.retrieveCookies) {
			this.#options.cookies.retrieveCookies(context, uri, callback);
		} else {
			let globalCookies = context && context.cookieStore;
			if (!globalCookies) {
				globalCookies = this.#options.globalCookies;
			}
			const cookies: any[] = [];
			const jar = globalCookies[uri.hostname];
			if (jar) {
				for (const name in jar) {
					if (jar.hasOwnProperty(name)) {
						cookies.push(jar[name]);
					}
				}
			}
			callback(null, cookies);
		}
	}

	private asyncForEach(array: string | any[], index: number, operation: { (element: any, callback: any): void; (arg0: any, arg1: () => void): void; }, callback: { (): void; (): void; }) {
		while (index < array.length) {
			let complete = false;
			let proceed = false;
			operation(array[index], () => {
				complete = true;
				if (proceed) {
					++index;
					this.asyncForEach(array, index, operation, callback);
				}
			});
			if (complete) {
				++index;
			} else {
				proceed = true;
				break;
			}
		}
		if (index === array.length) {
			callback();
		}
	}

	private secure(uri: { host?: any; href?: any; protocol?: any; }) {
		return /^https/i.test(uri.protocol ?? "");
	}

	private debug(...args: any[]) {
		if (this.#options.logLevel === "debug") {
			console.log.apply(this, Array.from(args));
		}
	}
}

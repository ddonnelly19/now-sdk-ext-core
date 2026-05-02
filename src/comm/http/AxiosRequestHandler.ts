import axios, { AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios";
import { Cookie } from "tough-cookie";
import { DOMParser } from "@xmldom/xmldom";
import { IAuthenticationHandler, SessionOrToken } from "../../auth/IAuthenticationHandler.js";
import { Logger } from "../../util/Logger.js";
import { HTTPRequest } from "./HTTPRequest.js";
import { HttpResponse } from "./HttpResponse.js";
import { ICookieStore } from "./ICookieStore.js";
import { IHttpResponse } from "./IHttpResponse.js";
import { IRequestHandler } from "./IRequestHandler.js";

export class AxiosRequestHandler implements IRequestHandler {
	_logger: Logger = new Logger("AxiosRequestHandler");
	_cookies!: Cookie[];

	_cookieStore!: ICookieStore;
	_authHandler: IAuthenticationHandler;

	_session!: SessionOrToken;

	public constructor(authHandler: IAuthenticationHandler) {
		this._authHandler = authHandler;
	}

	public setSession(session: SessionOrToken) {
		this._session = session;
	}

	isValidXmlString(xmlString: string) {
		try {
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlString, "application/xml");

			const parserError = xmlDoc.getElementsByTagName("parsererror");
			if (parserError.length > 0) {
				return false;
			}

			return true;
		} catch (e) {
			return false;
		}
	}

	private async doRequest<T>(request: HTTPRequest): Promise<HttpResponse<T>> {
		let response!: HttpResponse<T>;
		const config = this.getAxiosRequestConfig(request);
		this._logger.debug("Retrieved Configuration", { config: config });

		const resp = await axios.request(config);
		const responseBodyString = this.getResponseBodyAsString(resp.data);

		if (resp.status < 200 || resp.status >= 300) {
			this._logger.error("Error during request.", { error: resp, request: request });
			this._logger.error("Response Details:", { body: responseBodyString, status: resp.status });
			throw new Error("Error during request. Status: " + resp.status + " Body: " + (responseBodyString !== null ? responseBodyString : "[no response body]"));
		}

		if (responseBodyString !== null && responseBodyString !== "") {
			let data: string | T;
			try {
				data = JSON.parse(responseBodyString);
			} catch (ex) {
				data = responseBodyString;
			}

			response = new HttpResponse(data as T);
			response.data = data as T;
			response.body = responseBodyString;
		} else {
			response = new HttpResponse<T>(null as unknown as T);
		}

		response.status = resp.status;
		response.statusText = resp.statusText;
		response.headers = this.normalizeHeaders(resp);
		response.cookies = this.getSetCookieValues(resp);
		response.config = config;

		return response;
	}

	public async post<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		request.method = "POST";
		let response: IHttpResponse<T> | undefined;
		try {
			response = await this.doRequest<T>(request);
			this._logger.debug("Http SN POST Response Received", response);

			try {
				if (!((response.data) instanceof String)) {
					response.bodyObject = response.data;
				}
			} catch (ex) {
				this._logger.error("Error setting response.bodyObject.", { error: ex, response: response, request: request });
			}

			return response;
		} catch (ex) {
			this._logger.error("Error during POST request.", { error: ex, response: response, request: request });
			throw ex instanceof Error ? ex : new Error(String(ex));
		}
	}

	public async put<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		request.method = "PUT";
		let response: IHttpResponse<T> | undefined;
		try {
			response = await this.doRequest<T>(request);
			this._logger.debug("Http PUT Response Received", response);
			try {
				if (!((response.data) instanceof String)) {
					response.bodyObject = response.data;
				}
			} catch (ex) {
				this._logger.error("Error setting response.bodyObject.", { error: ex, response: response, request: request });
			}

			return response;
		} catch (ex) {
			this._logger.error("Error during PUT request.", { error: ex, response: response, request: request });
			throw ex instanceof Error ? ex : new Error(String(ex));
		}
	}

	public async get<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		request.method = "GET";
		let response: IHttpResponse<T> | undefined;
		try {
			response = await this.doRequest<T>(request);
			this._logger.debug("Http SN GET Response Received", response);

			try {
				if (!((response.data) instanceof String)) {
					response.bodyObject = response.data;
				}
			} catch (ex) {
				this._logger.error("Error setting response.bodyObject.", { error: ex, response: response, request: request });
			}

			return response;
		} catch (ex) {
			this._logger.error("Error during GET request.", { error: ex, response: response, request: request });
			throw ex instanceof Error ? ex : new Error(String(ex));
		}
	}

	public async delete<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		request.method = "DELETE";
		let response: IHttpResponse<T> | undefined;
		try {
			response = await this.doRequest<T>(request);

			try {
				if (!((response.data) instanceof String)) {
					response.bodyObject = response.data;
				}
			} catch (ex) {
				this._logger.error("Error setting response.bodyObject.", { error: ex, response: response, request: request });
			}

			return response;
		} catch (ex) {
			this._logger.error("Error during DELETE request.", { error: ex, response: response, request: request });
			throw ex instanceof Error ? ex : new Error(String(ex));
		}
	}

	private getAxiosRequestConfig(request: HTTPRequest): AxiosRequestConfig {
		const session = this._session as SessionOrToken | undefined;
		const instanceUrl = (session as { instanceUrl?: string } | undefined)?.instanceUrl;

		const headers: RawAxiosRequestHeaders = {
			...((request.headers ?? {}) as RawAxiosRequestHeaders)
		};

		if (session && "access_token" in session) {
			const tokenType = session.token_type ? session.token_type : "Bearer";
			headers.Authorization = `${tokenType} ${session.access_token}`;
		}

		if (session && "userToken" in session && session.userToken) {
			headers["X-UserToken"] = session.userToken;
		}

		if (session && "cookie" in session && session.cookie && instanceUrl) {
			const cookieString = session.cookie.getCookieStringSync(instanceUrl);
			if (cookieString) {
				headers.Cookie = cookieString;
			}
		}

		let data: unknown = undefined;
		if (request.fields) {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries(request.fields)) {
				if (typeof value !== "undefined" && value !== null) {
					params.append(key, String(value));
				}
			}
			data = params.toString();
		} else if (request.body) {
			data = request.body;
		} else if (request.json) {
			data = request.json;
		}

		const path = request.path;
		const url = path.startsWith("http://") || path.startsWith("https://")
			? path
			: `${instanceUrl ?? ""}${path}`;

		return {
			url,
			method: request.method as AxiosRequestConfig["method"],
			params: request.query ?? undefined,
			headers,
			data,
			responseType: "text",
			transformResponse: [(raw) => raw],
			validateStatus: () => true
		};
	}

	private getResponseBodyAsString(data: unknown): string | null {
		if (typeof data === "string") {
			return data;
		}

		if (typeof data === "undefined" || data === null) {
			return null;
		}

		try {
			return JSON.stringify(data);
		} catch {
			return String(data);
		}
	}

	private normalizeHeaders(response: AxiosResponse): Record<string, string> {
		const normalized: Record<string, string> = {};

		for (const [key, value] of Object.entries(response.headers ?? {})) {
			if (typeof value === "undefined") {
				continue;
			}

			if (Array.isArray(value)) {
				normalized[key] = value.join("; ");
			} else {
				normalized[key] = String(value);
			}
		}

		return normalized;
	}

	private getSetCookieValues(response: AxiosResponse): string[] {
		const setCookieHeader = response.headers?.["set-cookie"];
		if (!setCookieHeader) {
			return [];
		}

		if (Array.isArray(setCookieHeader)) {
			return setCookieHeader.map((value) => String(value));
		}

		return [String(setCookieHeader)];
	}
}
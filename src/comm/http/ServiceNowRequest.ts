import { AuthenticationHandlerFactory } from "../../auth/AuthenticationHandlerFactory.js";
import { IAuthenticationHandler } from "../../auth/IAuthenticationHandler.js";
import { ServiceNowInstance } from "../../sn/ServiceNowInstance.js";
import { HTTPRequest } from "./HTTPRequest.js";
import { IHttpResponse } from "./IHttpResponse.js";
import { IRequestHandler } from "./IRequestHandler.js";
import { RequestHandlerFactory } from "./RequestHandlerFactory.js";


export class ServiceNowRequest {

	_requestHandler: IRequestHandler;
	auth: IAuthenticationHandler;

	private _instance: ServiceNowInstance;

	public constructor(instance: ServiceNowInstance) {
		// let self:ServiceNowRequest = this;


		this._instance = instance;


		this.auth = AuthenticationHandlerFactory.createAuthHandler(this._instance);
		this._requestHandler = RequestHandlerFactory.createRequestHandler(this.auth);
		this.auth.setRequestHandler(this._requestHandler);

	}

	public async executeRequest<T>(request: HTTPRequest) {
		let httpMethod = request.method;

		if (typeof httpMethod != "undefined" && httpMethod) {
			httpMethod = httpMethod.trim().toLowerCase();

			switch (httpMethod) {
				case "post":
					return await this.post<T>(request);

				case "put":
					return await this.put<T>(request);

				case "get":
					return await this.get<T>(request);

				case "delete":
					return await this.delete<T>(request);

			}
		}

		throw new Error("Method must be populated on HTTPRequest object in order to utlize executeRequest.");
	}


	public async put<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		if (!this.isLoggedIn())
			await this.ensureLoggedIn();

		return await this._requestHandler.put<T>(request);
	}

	public async post<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		if (!this.isLoggedIn())
			await this.ensureLoggedIn();

		return await this._requestHandler.post<T>(request);
	}

	public async get<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		if (!this.isLoggedIn())
			await this.ensureLoggedIn();

		return await this._requestHandler.get<T>(request);
	}

	public async delete<T>(request: HTTPRequest): Promise<IHttpResponse<T>> {
		if (!this.isLoggedIn())
			await this.ensureLoggedIn();

		return await this._requestHandler.delete<T>(request);
	}

	public async getUserSession() {
		if (this.isLoggedIn()) {
			return this.auth.getSession();
		} else {
			return this.auth.doLogin();
		}
	}


	private async ensureLoggedIn() {


		await this.auth.doLogin();


	}

	isLoggedIn(): Boolean {
		return this.getAuth().isLoggedIn();
	}

	public getAuth(): IAuthenticationHandler {
		return this.auth;
	}

}
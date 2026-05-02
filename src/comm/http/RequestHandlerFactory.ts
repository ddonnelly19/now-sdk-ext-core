import { IAuthenticationHandler } from "../../auth/IAuthenticationHandler.js";
import { IRequestHandler } from "./IRequestHandler.js";
import { AxiosRequestHandler } from "./AxiosRequestHandler.js";

export class RequestHandlerFactory {

	public static createRequestHandler(authHandler: IAuthenticationHandler): IRequestHandler {
		return new RequestHandler(authHandler);
	}
	
	public static createAxiosRequestHandler(authHandler: IAuthenticationHandler): IRequestHandler {
		return new AxiosRequestHandler(authHandler);
	}
}
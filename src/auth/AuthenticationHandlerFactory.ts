import { ServiceNowInstance } from "../sn/ServiceNowInstance.js";
import { IAuthenticationHandler } from "./IAuthenticationHandler.js";
import { NowSDKAuthenticationHandler } from "./NowSDKAuthenticationHandler.js";


export class AuthenticationHandlerFactory {


	public static createAuthHandler(instance: ServiceNowInstance): IAuthenticationHandler {
		return new NowSDKAuthenticationHandler(instance);
	}
}
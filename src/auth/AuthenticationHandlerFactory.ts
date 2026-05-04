import { IServiceNowInstance } from "../sn/IServiceNowInstance.js";
import { IAuthenticationHandler } from "./IAuthenticationHandler.js";
import { NowSDKAuthenticationHandler } from "./NowSDKAuthenticationHandler.js";


export class AuthenticationHandlerFactory {


	public static createAuthHandler(instance: IServiceNowInstance): IAuthenticationHandler {
		return new NowSDKAuthenticationHandler(instance);
	}
}
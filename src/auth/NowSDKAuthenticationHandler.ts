import { IRequestHandler } from "../comm/http/IRequestHandler.js";
import { Logger } from "../util/Logger.js";
import { IAuthenticationHandler } from "./IAuthenticationHandler.js";
import { ICookieStore } from "../comm/http/ICookieStore.js";
import { ServiceNowInstance } from "../sn/ServiceNowInstance.js";
import { getSafeUserSession } from "@servicenow/sdk-cli-core/dist/util/sessionToken.js"


export class NowSDKAuthenticationHandler implements IAuthenticationHandler {

	private _requestHandler!: IRequestHandler;

	private _isLoggedIn: boolean = false;

	private _session?;

	private _logger: Logger;

	private _instance: ServiceNowInstance;

	public constructor(instance: ServiceNowInstance) {
		this._logger = new Logger("NowSDKAuthenticationHandler");
		this._instance = instance;
	}

	public async doLogin() {
	
		this._session = await this.login();

		return this._session;
	}

	private async login() {

		try {
			const auth = { credentials: this._instance.credential };
			const session = await getSafeUserSession(auth, this._logger);
			if (session) {
				this._requestHandler.setSession(session);
				this.setLoggedIn(true);
			} else {
				throw new Error("Unable to login.");
			}

			this._logger.debug("Login Attempt Complete.");
			return session;
		} catch (e) {
			this._logger.error("Error during login.", e);
			throw e;
		}
	
	}

	public getRequestHandler(): IRequestHandler {
		return this._requestHandler;
	}

	public setRequestHandler(requestHandler: IRequestHandler) {
		this._requestHandler = requestHandler;
	}

	public isLoggedIn(): boolean {
		return this._isLoggedIn;
	}

	public setLoggedIn(loggedIn: boolean) {
		this._isLoggedIn = loggedIn;
	}

	public getToken() {		
		return (this._session).getToken() as string;
	}

	public getCookies(): ICookieStore {		
		return this._session?.getCookies();
	}

	public getSession() {
		return this._session;
	}
}
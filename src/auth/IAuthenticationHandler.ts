import { AccessToken, UserSession } from "@servicenow/sdk-cli-core/dist/auth/index.js";
import { ICookieStore } from "../comm/http/ICookieStore.js";
import { IRequestHandler } from "../comm/http/IRequestHandler.js";

export type SessionOrToken = Merge<UserSession | AccessToken>

export interface IAuthenticationHandler{

    doLogin(): SessionOrToken | undefined | Promise<SessionOrToken | undefined>;

    getRequestHandler():IRequestHandler;

    setRequestHandler(requestHandler:IRequestHandler): void;

    isLoggedIn():Boolean;

    setLoggedIn(loggedIn:Boolean);

    getToken():string | undefined;

    getCookies(): ICookieStore | undefined;

    getSession(): SessionOrToken | undefined
}
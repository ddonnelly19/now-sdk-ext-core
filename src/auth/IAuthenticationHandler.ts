import { ICookieStore } from "../comm/http/ICookieStore.js";
import { IRequestHandler } from "../comm/http/IRequestHandler.js";


export interface IAuthenticationHandler{

    doLogin();

    getRequestHandler():IRequestHandler;

    setRequestHandler(requestHandler:IRequestHandler);

    isLoggedIn():Boolean;

    setLoggedIn(loggedIn:Boolean);

    getToken():string;

    getCookies():ICookieStore;

    getSession():any;
}
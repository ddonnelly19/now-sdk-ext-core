import { IAuthenticationHandler } from "../../auth/IAuthenticationHandler.js";
import { IServiceNowInstance } from "../../sn/IServiceNowInstance.js";
import { IRequestHandler } from "./IRequestHandler.js";
import { RequestHandler } from "./RequestHandler.js";

export class RequestHandlerFactory{

    public static createRequestHandler( authHandler:IAuthenticationHandler):IRequestHandler{
        return new RequestHandler( authHandler);
    }
}

import { SessionOrToken } from "../../auth/IAuthenticationHandler.js";
import { HTTPRequest } from "./HTTPRequest.js";
import { IHttpResponse } from "./IHttpResponse.js";

export interface IRequestHandler{
    post<T>(request: HTTPRequest) : Promise<IHttpResponse<T>> ;
    
    put<T>(request: HTTPRequest) : Promise<IHttpResponse<T>> ;

    get<T>(request: HTTPRequest) : Promise<IHttpResponse<T>> ;

    delete<T>(request: HTTPRequest) : Promise<IHttpResponse<T>> ;

  
    setSession(session: SessionOrToken): void;

}
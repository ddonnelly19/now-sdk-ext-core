
import { IServiceNowInstance } from "../../sn/IServiceNowInstance.js";
import { ServiceNowInstance } from "../../sn/ServiceNowInstance.js";
import { HTTPRequest } from "./HTTPRequest.js";
import { IHttpResponse } from "./IHttpResponse.js";
import { ServiceNowRequest } from "./ServiceNowRequest.js";
import { PROCESSFLOW_API_BASE } from "../../constants/ServiceNow.js";

/**
 * HTTP wrapper for the ServiceNow ProcessFlow REST API (`/api/now/processflow/`).
 *
 * Provides typed GET and POST methods with path interpolation for operations
 * such as retrieving flow definitions, testing flows, and other Flow Designer
 * REST interactions.
 *
 * Usage:
 * ```ts
 * const pfr = new ProcessFlowRequest(instance);
 * const def = await pfr.get<FlowDefResponse>('flow/{flow_sys_id}', { flow_sys_id: id }, queryParams);
 * const res = await pfr.post<TestResponse>('flow/{flow_sys_id}/test', { flow_sys_id: id }, queryParams, body);
 * ```
 *
 * Note: The `as ServiceNowInstance` cast in `_doRequest` mirrors the pattern
 * used by TableAPIRequest. The root fix (accepting IServiceNowInstance in
 * ServiceNowRequest's constructor) is a broader refactor tracked separately.
 */
export class ProcessFlowRequest {

    private _headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    private _snInstance: IServiceNowInstance;

    public constructor(instance: IServiceNowInstance) {
        this._snInstance = instance;
    }

    /**
     * GET a resource from the processflow API.
     * @param pathTemplate Path template relative to /api/now/processflow/ (e.g. "flow/{flow_sys_id}")
     * @param pathVars Variables to interpolate into the path template
     * @param query Optional query parameters
     */
    public async get<T>(pathTemplate: string, pathVars: Record<string, string>, query?: Record<string, string>): Promise<IHttpResponse<T>> {
        const uri = this._buildUri(pathTemplate, pathVars);
        return this._doRequest<T>(uri, "get", query ?? null, null);
    }

    /**
     * POST to a resource on the processflow API.
     * @param pathTemplate Path template relative to /api/now/processflow/ (e.g. "flow/{flow_sys_id}/test")
     * @param pathVars Variables to interpolate into the path template
     * @param query Optional query parameters
     * @param body JSON body to send
     */
    public async post<T>(pathTemplate: string, pathVars: Record<string, string>, query?: Record<string, string>, body?: object): Promise<IHttpResponse<T>> {
        const uri = this._buildUri(pathTemplate, pathVars);
        return this._doRequest<T>(uri, "post", query ?? null, body ?? null);
    }

    private _doRequest<T>(uri: string, httpMethod: string, query: Record<string, string> | null, bodyData: object | null): Promise<IHttpResponse<T>> {
        const req: ServiceNowRequest = new ServiceNowRequest(this._snInstance as ServiceNowInstance);
        const request: HTTPRequest = { path: uri, method: httpMethod, headers: this._headers, query: query, body: null, json: bodyData };
        return req.executeRequest<T>(request);
    }

    private _buildUri(pathTemplate: string, pathVars: Record<string, string>): string {
        let path = pathTemplate;
        for (const [key, value] of Object.entries(pathVars)) {
            path = path.replaceAll(`{${key}}`, encodeURIComponent(value));
        }
        return `${PROCESSFLOW_API_BASE}/${path}`;
    }
}

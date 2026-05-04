import type { IServiceNowInstance } from "../../sn/IServiceNowInstance.js";
import type { HTTPRequest } from "./HTTPRequest.js";
import type { IHttpResponse } from "./IHttpResponse.js";
import { SessionManager } from "./SessionManager.js";

export type JsonRequestMethod = NonNullable<HTTPRequest["method"]> | Lowercase<NonNullable<HTTPRequest["method"]>>;
export type JsonRequestQuery = HTTPRequest["query"];
export type JsonRequestBody = Record<string, unknown> | null;

/** Shared JSON headers used by HTTP wrappers that send and receive JSON. */
export const JSON_REQUEST_HEADERS: Readonly<Record<string, string>> = Object.freeze({
	"Content-Type": "application/json",
	"Accept": "application/json"
});

/**
 * Executes a JSON request through the shared SessionManager pipeline.
 *
 * This keeps wrapper classes focused on URL construction and payload shaping
 * while centralizing the common headers and request descriptor structure.
 */
export function executeJsonSessionRequest<T>(
	instance: IServiceNowInstance,
	path: string,
	method: JsonRequestMethod,
	query: JsonRequestQuery,
	body: JsonRequestBody
): Promise<IHttpResponse<T>> {
	const request: HTTPRequest = {
		path,
		method: normalizeRequestMethod(method),
		headers: JSON_REQUEST_HEADERS,
		query: normalizeRequestQuery(query),
		body: null,
		json: body
	};

	return SessionManager.getInstance().getRequest(instance).executeRequest<T>(request);
}

function normalizeRequestMethod(method: JsonRequestMethod): HTTPRequest["method"] {
	return method as HTTPRequest["method"];
}

function normalizeRequestQuery(query: JsonRequestQuery): HTTPRequest["query"] {
	return query as HTTPRequest["query"];
}
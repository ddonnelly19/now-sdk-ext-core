import { HTTPRequest } from "../comm/http/HTTPRequest.js";
import { IHttpResponse } from "../comm/http/IHttpResponse.js";
import { ServiceNowRequest } from "../comm/http/ServiceNowRequest.js";
import { ServiceNowInstance } from "./ServiceNowInstance.js";


export class ProgressWorker {

	_req: ServiceNowRequest;


	_instance: ServiceNowInstance;
	public constructor(instance: ServiceNowInstance) {
		this._instance = instance;
		this._req = new ServiceNowRequest(instance);
	}

	public async getProgress(progressId: string): Promise<ProgressResult | null> {
		const request: HTTPRequest = { path: `/api/sn_cicd/progress/${progressId}`, headers: null, query: null, body: null };
		const resp: IHttpResponse<ProgressResultResponse> = await this._req.get<ProgressResultResponse>(request);
		if (resp.status == 200) {
			return resp.bodyObject?.result ?? null;
		}
		return null;
	}
}


export type ProgressResultResponse = {
	"result": ProgressResult;
}

export type ProgressLinks = {
	"progress": ProgressLink;
	"results": ProgressLink;
}

export type ProgressLink = {
	"id": string;
	"url": string;
}

export type ProgressResult = {
	"links": ProgressLinks;
	"status": string;
	"status_label": string;
	"status_message": string;
	"status_detail": string;
	"error": string;
	"percent_complete": number;

}

export enum ProgressStatus {
	"PENDING" = "0",
	"RUNNING" = "1",
	"FAILED" = "3"
}
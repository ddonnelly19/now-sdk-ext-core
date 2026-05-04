import { ServiceNowRequest } from "../comm/http/ServiceNowRequest.js";
import { Logger } from "../util/Logger.js";
import { IServiceNowInstance } from "./IServiceNowInstance.js";


export abstract class SNRequestBase {
	private _snInstance: IServiceNowInstance;


	private _req: ServiceNowRequest;


	_logger: Logger = new Logger("ATFTestExecutor");

	public constructor(instance: IServiceNowInstance) {
		this._snInstance = instance;
		this._req = new ServiceNowRequest(this._snInstance);
	}

	public get request(): ServiceNowRequest {
		return this._req;
	}
	public set request(value: ServiceNowRequest) {
		this._req = value;
	}

	public get snInstance(): IServiceNowInstance {
		return this._snInstance;
	}
	public set snInstance(value: IServiceNowInstance) {
		this._snInstance = value;
	}

}
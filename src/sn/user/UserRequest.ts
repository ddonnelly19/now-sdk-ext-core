import { IHttpResponse } from "../../comm/http/IHttpResponse.js";
import { TableAPIRequest } from "../../comm/http/TableAPIRequest.js";
import { ServiceNowTableResponse } from "../../model/types.js";
import { ServiceNowInstance } from "../ServiceNowInstance.js";
import { SNRequestBase } from "../SNRequestBase.js";
import { IUser } from "./model/IUser.js";


export class UserRequest extends SNRequestBase {


	public constructor(instance: ServiceNowInstance) {
		super(instance);
	}

	// private async getUser(userId:string):Promise<IUser>{


	//     const request:HTTPRequest = { path: "/api/now/table/sys_atf_test_result?sysparm_query=sys_id="+userId, headers: null, query: null, body:null};
	//     const resp:HttpResponse<ServiceNowTableResponse<IUser>> = await this.request.get<ServiceNowTableResponse<IUser>>(request);
	//     if(resp.status == 200){
	//         const tableResp:ServiceNowTableResponse<IUser> =  resp.bodyObject;
	//         if(tableResp.result && tableResp.result.length > 0){
	//             return tableResp.result[0];
	//         }

	//     }

	//     return null;
	// }

	public async getUser(userId: string): Promise<IUser> {

		const request: TableAPIRequest = new TableAPIRequest(this.snInstance);
		const params: object = {};
		params["sysparm_query"] = "sys_id=" + userId;



		const resp: IHttpResponse<ServiceNowTableResponse<IUser>> = await request.get<ServiceNowTableResponse<IUser>>("sys_user", params);
		if (resp.status == 200) {
			const tableResp: ServiceNowTableResponse<IUser> = resp.bodyObject!;
			if (tableResp.result && tableResp.result.length > 0) {
				return tableResp.result[0];
			}

		}
		return null as unknown as IUser;
	}

}
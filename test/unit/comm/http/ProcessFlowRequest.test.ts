import { vi } from 'vitest';
import { ProcessFlowRequest } from '../../../../src/comm/http/ProcessFlowRequest.js';
import { ServiceNowRequest } from '../../../../src/comm/http/ServiceNowRequest.js';
import { SessionManager } from '../../../../src/comm/http/SessionManager.js';
import { PROCESSFLOW_API_BASE } from '../../../../src/constants/ServiceNow.js';
import { IHttpResponse } from '../../../../src/comm/http/IHttpResponse.js';
import { IServiceNowInstance } from '../../../../src/sn/IServiceNowInstance.js';

describe('ProcessFlowRequest', () => {
	let processFlowRequest: ProcessFlowRequest;
	let mockInstance: IServiceNowInstance;
	let executeRequestMock: ReturnType<typeof vi.fn>;
	let getRequestSpy: ReturnType<typeof vi.spyOn>;

	const mockResponse: IHttpResponse<unknown> = {
		data: { result: { status: 'ok' } },
		status: 200,
		statusText: 'OK',
		headers: {},
		config: {},
		bodyObject: { result: { status: 'ok' } }
	};

	beforeEach(() => {
		vi.clearAllMocks();
		SessionManager.resetInstance();

		executeRequestMock = vi.fn().mockResolvedValue(mockResponse);
		getRequestSpy = vi.spyOn(SessionManager.getInstance(), 'getRequest').mockReturnValue({
			executeRequest: executeRequestMock
		} as unknown as ServiceNowRequest);

		mockInstance = {
			getAlias: vi.fn().mockReturnValue('test-instance'),
			getHost: vi.fn().mockReturnValue('<servicenow_instance_url>')
		} as unknown as IServiceNowInstance;

		processFlowRequest = new ProcessFlowRequest(mockInstance);
	});

	it('builds a GET request with encoded path variables', async () => {
		await processFlowRequest.get('flow/{flow_sys_id}', { flow_sys_id: 'abc 123/456' }, { include: 'steps' });

		expect(getRequestSpy).toHaveBeenCalledWith(mockInstance);
		expect(executeRequestMock).toHaveBeenCalledTimes(1);
		expect(executeRequestMock).toHaveBeenCalledWith({
			path: `${PROCESSFLOW_API_BASE}/flow/abc%20123%2F456`,
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			query: { include: 'steps' },
			body: null,
			json: null
		});
	});

	it('builds a POST request with optional query and JSON body', async () => {
		const body = { dry_run: true };

		const response = await processFlowRequest.post(
			'flow/{flow_sys_id}/test',
			{ flow_sys_id: 'flow-id' },
			{ mode: 'preview' },
			body
		);

		expect(response).toBe(mockResponse);
		expect(executeRequestMock).toHaveBeenCalledWith({
			path: `${PROCESSFLOW_API_BASE}/flow/flow-id/test`,
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			query: { mode: 'preview' },
			body: null,
			json: body
		});
	});
});
import { vi } from 'vitest';
import { executeJsonSessionRequest, JSON_REQUEST_HEADERS } from '../../../../src/comm/http/JsonSessionRequest.js';
import { SessionManager } from '../../../../src/comm/http/SessionManager.js';
import { ServiceNowRequest } from '../../../../src/comm/http/ServiceNowRequest.js';
import { ServiceNowInstance } from '../../../../src/sn/ServiceNowInstance.js';
import { IHttpResponse } from '../../../../src/comm/http/IHttpResponse.js';

describe('JsonSessionRequest', () => {
	let mockInstance: ServiceNowInstance;
	let executeRequestMock: ReturnType<typeof vi.fn>;
	let getRequestSpy: ReturnType<typeof vi.spyOn>;

	const mockResponse: IHttpResponse<unknown> = {
		data: { result: 'ok' },
		status: 200,
		statusText: 'OK',
		headers: {},
		config: {},
		bodyObject: { result: 'ok' }
	};

	beforeEach(() => {
		vi.clearAllMocks();

		executeRequestMock = vi.fn().mockResolvedValue(mockResponse);
		getRequestSpy = vi.spyOn(SessionManager.getInstance(), 'getRequest').mockReturnValue({
			executeRequest: executeRequestMock
		} as unknown as ServiceNowRequest);

		mockInstance = {
			getAlias: vi.fn().mockReturnValue('test-instance'),
			getHost: vi.fn().mockReturnValue('<servicenow_instance_url>')
		} as unknown as ServiceNowInstance;
	});

	it('delegates through SessionManager with shared JSON headers', async () => {
		const response = await executeJsonSessionRequest(
			mockInstance,
			'/api/now/table/incident',
			'POST',
			{ sysparm_limit: 1 },
			{ short_description: 'Test' }
		);

		expect(response).toBe(mockResponse);
		expect(getRequestSpy).toHaveBeenCalledWith(mockInstance);
		expect(executeRequestMock).toHaveBeenCalledWith({
			path: '/api/now/table/incident',
			method: 'POST',
			headers: JSON_REQUEST_HEADERS,
			query: { sysparm_limit: 1 },
			body: null,
			json: { short_description: 'Test' }
		});
	});

	it('preserves URLSearchParams queries used by table wrappers', async () => {
		const query = new URLSearchParams({ sysparm_query: 'active=true' });

		await executeJsonSessionRequest(
			mockInstance,
			'/api/now/table/incident',
			'get',
			query,
			null
		);

		expect(executeRequestMock).toHaveBeenCalledWith({
			path: '/api/now/table/incident',
			method: 'get',
			headers: JSON_REQUEST_HEADERS,
			query,
			body: null,
			json: null
		});
	});
});
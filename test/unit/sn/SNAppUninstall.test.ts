/**
 * Unit tests for Application Uninstall functionality
 * Uses mocks instead of real credentials
 */

import { vi } from 'vitest';

// Hoist mock variables so they can be used in vi.mock() factories
const { mockGetCredentials, mockGetSafeUserSession } = vi.hoisted(() => ({
    mockGetCredentials: vi.fn().mockResolvedValue({
        host: 'test-instance.service-now.com',
        username: 'mock.user',
        password: 'mock-password',
        instanceUrl: 'https://test-instance.service-now.com',
        token: 'mock-oauth-token',
        type: 'basic',
        alias: 'test-instance',
        authType: 'basic'
    }),
    mockGetSafeUserSession: vi.fn().mockResolvedValue({
        username: 'mock.user',
        host: 'test-instance.service-now.com',
        token: 'mock-session-token',
        sessionId: 'mock-session-id',
        instanceUrl: 'https://test-instance.service-now.com'
    })
}));

import { ServiceNowInstance, ServiceNowSettingsInstance } from '../../../src/sn/ServiceNowInstance.js';
import { Application } from '../../../src/sn/Application.js';

vi.mock('@servicenow/sdk-cli/dist/auth/index.js', () => ({
    getCredentials: mockGetCredentials
}));

vi.mock('@servicenow/sdk-cli-core/dist/util/sessionToken.js', () => ({
    getSafeUserSession: mockGetSafeUserSession
}));

// Mock SDK utilities
vi.mock('@servicenow/sdk-cli-core/dist/util/index.js', () => ({
    parseXml: vi.fn(),
    getScopeMetadataFromInstance: vi.fn(),
    getNowTableRequest: vi.fn(),
    monitorUninstallWorkerCompletion: vi.fn(),
    getAppAndSummary: vi.fn()
}));

vi.mock('@servicenow/sdk-cli-core/dist/http/index.js', () => ({
    makeRequest: vi.fn(),
    parseResponseBody: vi.fn()
}));

describe('SNAppUninstall - Unit Tests', () => {
    let instance: ServiceNowInstance;
    const TEST_SCOPE = 'x_test_app';
    const TEST_APP_ID = 'test-app-id-123';

    beforeEach(async () => {
        vi.clearAllMocks();
        
        const alias:string = 'test-instance';
        const credential = await mockGetCredentials(alias);
        
        if(credential){
            const snSettings:ServiceNowSettingsInstance = {
                alias: alias,
                credential: credential
            }
            instance = new ServiceNowInstance(snSettings);
        }
    });

    describe('Application changeApplication', () => {
        it('should create Application instance', () => {
            const app = new Application(instance, TEST_SCOPE, TEST_APP_ID);
            expect(app).toBeInstanceOf(Application);
        });

        it('should have changeApplication method', () => {
            const app = new Application(instance, TEST_SCOPE, TEST_APP_ID);
            expect(typeof app.changeApplication).toBe('function');
        });
    });

    describe('Application scope handling', () => {
        it('should handle global scope', () => {
            const app = new Application(instance, 'global', TEST_APP_ID);
            expect((app as any)._scope).toBe('global');
        });

        it('should handle custom scope', () => {
            const app = new Application(instance, 'x_custom_app', TEST_APP_ID);
            expect((app as any)._scope).toBe('x_custom_app');
        });
    });

    // Note: Actual uninstall operations are in integration tests
    // These unit tests focus on initialization and structure
});

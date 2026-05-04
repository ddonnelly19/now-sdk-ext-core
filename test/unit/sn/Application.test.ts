/**
 * Unit tests for Application class
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

// Mock other SDK utilities
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

describe('Application - Unit Tests', () => {
    let instance: ServiceNowInstance;
    let application: Application;
    const TEST_SCOPE = 'x_test_app';
    const TEST_APP_ID = 'test-app-sys-id-123';
    
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
            application = new Application(instance, TEST_SCOPE, TEST_APP_ID);
        }
    });

    describe('Constructor', () => {
        it('should create instance with scope and app ID', () => {
            expect(application).toBeInstanceOf(Application);
            expect((application as any)._scope).toBe(TEST_SCOPE);
            expect((application as any)._applicationId).toBe(TEST_APP_ID);
        });

        it('should initialize ServiceNowRequest', () => {
            expect((application as any).snRequest).toBeDefined();
        });

        it('should initialize logger', () => {
            expect((application as any)._logger).toBeDefined();
        });

        it('should store instance reference', () => {
            expect((application as any).instance).toBe(instance);
        });
    });

    describe('Properties', () => {
        it('should have scope property', () => {
            expect((application as any)._scope).toBe(TEST_SCOPE);
        });

        it('should have applicationId property', () => {
            expect((application as any)._applicationId).toBe(TEST_APP_ID);
        });

        it('should accept different scopes', () => {
            const app1 = new Application(instance, 'global', 'app1');
            const app2 = new Application(instance, 'x_custom', 'app2');
            
            expect((app1 as any)._scope).toBe('global');
            expect((app2 as any)._scope).toBe('x_custom');
        });
    });

    describe('Method existence', () => {
        it('should have changeApplication method', () => {
            expect(typeof application.changeApplication).toBe('function');
        });

        it('should have convertToStoreApp method', () => {
            expect(typeof application.convertToStoreApp).toBe('function');
        });
    });

    // Note: Actual API interaction tests are in integration tests
    // These unit tests focus on initialization and structure
});

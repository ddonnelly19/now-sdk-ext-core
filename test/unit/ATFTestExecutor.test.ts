/**
 * Unit tests for ATFTestExecutor
 * Uses mocks instead of real credentials
 */

// Jest provides most globals automatically, but 'jest' object needs explicit import in ESM mode
import { jest } from '@jest/globals';

import { 
    ATFTestExecutor} from '../../src/sn/atf/ATFTestExecutor.js';
import { ServiceNowInstance, ServiceNowSettingsInstance } from '../../src/sn/ServiceNowInstance.js';
import { createGetCredentialsMock } from './__mocks__/servicenow-sdk-mocks.js';
import { getSafeUserSession } from '@servicenow/sdk-cli-core/dist/util/sessionToken.js';

// Mock getCredentials
const mockGetCredentials = createGetCredentialsMock();
jest.mock('@servicenow/sdk-cli-core/dist/util/sessionToken.js', () => ({
    getSafeUserSession: jest.fn<typeof getSafeUserSession>().mockResolvedValue(null)
}));

const SECONDS = 1000;

describe('ATFTestExecutor - Unit Tests', () => {
    let instance: ServiceNowInstance;
    let testExecutor: ATFTestExecutor;

    beforeEach(async () => {
        jest.clearAllMocks();
        
        const alias: string = 'test-instance';
        const credential = await mockGetCredentials(alias);
       
        if(credential){
            const snSettings:ServiceNowSettingsInstance = {
                alias: alias,
                credential: credential
            }
            instance = new ServiceNowInstance(snSettings);
            testExecutor = new ATFTestExecutor(instance);
        }
    });

    describe('Constructor', () => {
        it('should create instance with ServiceNow instance', () => {
            expect(testExecutor).toBeInstanceOf(ATFTestExecutor);
            expect((testExecutor as any)._instance).toBe(instance);
        });

        it('should initialize with instance', () => {
            expect((testExecutor as any)._instance).toBeDefined();
        });
    });

    describe('Instance properties', () => {
        it('should have ServiceNow instance', () => {
            expect((testExecutor as any)._instance).toBe(instance);
        });

        it('should maintain instance reference', () => {
            const executor1 = new ATFTestExecutor(instance);
            const executor2 = new ATFTestExecutor(instance);
            
            expect((executor1 as any)._instance).toBe((executor2 as any)._instance);
        });
    });

    // Note: Actual test execution tests are in integration tests
    // These unit tests focus on initialization and structure
    describe('Method existence', () => {
        it('should have executeTest method', () => {
            expect(typeof testExecutor.executeTest).toBe('function');
        });

        it('should have executeTestSuite method', () => {
            expect(typeof testExecutor.executeTestSuite).toBe('function');
        });

        it('should have private getTestResult method', () => {
            expect(typeof (testExecutor as any).getTestResult).toBe('function');
        });
    });
});

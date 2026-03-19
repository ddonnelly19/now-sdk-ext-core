/**
 * Unit tests for ProgressWorker
 * Uses mocks instead of real credentials
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ServiceNowInstance, ServiceNowSettingsInstance } from '../../../src/sn/ServiceNowInstance';
import { createGetCredentialsMock } from '../__mocks__/servicenow-sdk-mocks';
import { ProgressWorker } from '../../../src/sn/ProgressWorker';

// Mock getCredentials
const mockGetCredentials = createGetCredentialsMock();
jest.mock('@servicenow/sdk-cli/dist/auth/index.js', () => ({
    getCredentials: mockGetCredentials
}));

describe('ProgressWorker - Unit Tests', () => {
    let instance: ServiceNowInstance;
    let progressWorker: ProgressWorker;

    beforeEach(async () => {
        jest.clearAllMocks();
        
        const alias = 'test-instance';
        const credential = await mockGetCredentials(alias);
        
        if (credential) {
            const snSettings: ServiceNowSettingsInstance = {
                alias: alias,
                credential: credential
            };
            instance = new ServiceNowInstance(snSettings);
            progressWorker = new ProgressWorker(instance);
        }
    });

    describe('Constructor', () => {
        it('should create instance with ServiceNow instance', () => {
            expect(progressWorker).toBeInstanceOf(ProgressWorker);
            expect((progressWorker as any)._instance).toBe(instance);
        });

        it('should initialize ServiceNowRequest', () => {
            expect((progressWorker as any)._req).toBeDefined();
        });
    });

    describe('Method existence', () => {
        it('should have getProgress method', () => {
            expect(typeof progressWorker.getProgress).toBe('function');
        });
    });

    // Note: Actual progress monitoring tests are in integration tests
    // These unit tests focus on initialization and structure
});

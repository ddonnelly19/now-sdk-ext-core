/**
 * Unit tests for Channel class
 * Focuses on logic and state management
 */

// Jest provides most globals automatically, but 'jest' object needs explicit import in ESM mode
import { vi, Mock } from 'vitest';
import { Channel } from '../../../src/sn/amb/Channel.js';
import { ServerConnection } from '../../../src/sn/amb/ServerConnection.js';
import { ChannelListener } from '../../../src/sn/amb/ChannelListener.js';

// Mock Logger
vi.mock('../../../src/util/Logger', () => ({
    Logger: vi.fn().mockImplementation(function(this: any) {
        this.debug = vi.fn();
        this.info = vi.fn();
        this.warn = vi.fn();
        this.error = vi.fn();
        this.addErrorMessage = vi.fn();
        this.addWarnMessage = vi.fn();
    })
}));

describe('Channel - Unit Tests', () => {
    let mockCometD: {
        subscribe: Mock;
        unsubscribe: Mock;
        publish: Mock;
        getStatus: Mock;
    };
    let mockServerConnection: {
        getSubscriptionCommandSender: Mock;
    };
    let channel: Channel;
    const channelName = 'testChannelName';
	
	beforeEach(() => {
        // Create mock CometD
        mockCometD = {
            subscribe: vi.fn().mockReturnValue({ id: 'sub-123' }),
            unsubscribe: vi.fn(),
            publish: vi.fn(),
            getStatus: vi.fn().mockReturnValue('connected')
        };

        // Create mock ServerConnection
        mockServerConnection = {
            getSubscriptionCommandSender: vi.fn().mockReturnValue(null)
        };

        // Create channel instance
        channel = new Channel(
            mockServerConnection as unknown as ServerConnection,
            mockCometD,
            channelName,
            true
        );
    });

    function createMockListener(id: number = 1) {
        return {
            getCallback: vi.fn().mockReturnValue(() => 'listener callback'),
            getSubscriptionCallback: vi.fn().mockReturnValue(null),
            getID: vi.fn().mockReturnValue(id),
            resubscribe: vi.fn()
        };
    }

    describe('Constructor', () => {
        it('should create channel with name', () => {
            expect(channel).toBeInstanceOf(Channel);
            expect(channel.getName()).toBe(channelName);
        });

        it('should store server connection', () => {
            expect(channel.getServerConnection()).toBe(mockServerConnection);
		});
	});

    describe('getName', () => {
        it('should return channel name', () => {
            expect(channel.getName()).toBe(channelName);
        });
    });

    describe('getServerConnection', () => {
        it('should return server connection', () => {
            expect(channel.getServerConnection()).toBe(mockServerConnection);
		});
	});

    describe('subscribe', () => {
        it('should subscribe with channel listener', () => {
            const mockListener = createMockListener();
            
            const listenerId = channel.subscribe(mockListener as unknown as ChannelListener);
            
            expect(listenerId).toBe(1);
            expect(mockCometD.subscribe).toHaveBeenCalledTimes(1);
        });

        it('should return null when listener has no callback', () => {
            const mockListener = createMockListener();
            mockListener.getCallback.mockReturnValue(null);
            
            const listenerId = channel.subscribe(mockListener as unknown as ChannelListener);
            
            expect(listenerId).toBeNull();
            expect(mockCometD.subscribe).not.toHaveBeenCalled();
        });

        it('should not subscribe twice with same listener', () => {
            const mockListener = createMockListener();
            
            const listenerId1 = channel.subscribe(mockListener as unknown as ChannelListener);
            const listenerId2 = channel.subscribe(mockListener as unknown as ChannelListener);
            
            expect(listenerId1).toBe(listenerId2);
			expect(mockCometD.subscribe).toHaveBeenCalledTimes(1);
		});
	});

    describe('unsubscribe', () => {
        it('should unsubscribe listener', () => {
            const mockListener = createMockListener();
            
            channel.subscribe(mockListener as unknown as ChannelListener);
            channel.unsubscribe(mockListener as unknown as ChannelListener);
            
            const listeners = (channel as unknown as {listeners: unknown[]}).listeners;
            expect(listeners).toHaveLength(0);
		});
	});

    describe('publish', () => {
        it('should publish message via cometd', () => {
            const message = { data: 'test message' };
            
            channel.publish(message);
            
            expect(mockCometD.publish).toHaveBeenCalledWith(channelName, message);
		});
	});

    describe('resubscribe', () => {
        it('should reset subscription', () => {
            (channel as unknown as {subscription: unknown}).subscription = { id: 'old-sub' };
            
            channel.resubscribe();
            
            expect((channel as unknown as {subscription: unknown}).subscription).toBeNull();
		});
	});

    // Note: Full AMB functionality tests are in integration tests
    // These unit tests focus on basic Channel operations
});

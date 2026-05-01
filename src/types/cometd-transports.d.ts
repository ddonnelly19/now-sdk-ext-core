declare module "cometd/LongPollingTransport" {
    import { Transport } from "cometd";
    export class LongPollingTransport implements Transport {
        readonly type: string;
        url: string;
        accept(version: string, crossDomain: boolean, url: string): boolean;
        abort(): void;
    }
}

declare module "cometd/WebSocketTransport" {
    import { Transport } from "cometd";
    export class WebSocketTransport implements Transport {
        readonly type: string;
        url: string;
        accept(version: string, crossDomain: boolean, url: string): boolean;
        abort(): void;
    }
}

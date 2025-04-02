import type { ServerOptions, WebSocket } from "ws";
import type { EventDefinitions } from "./events";
import type { IncomingMessage } from "http";
import type { Promisable } from "./utils";
import type { Duplex } from "stream";

export type TSWSRPCOptions = {
	server?: ServerOptions;
	events?: EventDefinitions;
	lifecycle?: {
		onConnection?: (ws: WebSocket, request: IncomingMessage) => Promisable<void>;
		onError?: (error: Error) => Promisable<void>;
		onHeaders?: (headers: string[], request: IncomingMessage) => Promisable<void>;
		onClose?: () => Promisable<void>;
		onListening?: () => Promisable<void>;
		onClientError?: (
			error: Error,
			socket: Duplex,
			request: IncomingMessage,
		) => Promisable<void>;
	};
};

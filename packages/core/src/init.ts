import type { RPCWebSocketOptions } from "./types/options";
import { WebSocketServer, WebSocket } from "ws";
import type { Promisable } from "./types/utils";

export const init = async <O extends RPCWebSocketOptions>(options?: O) => {
	const server = new WebSocketServer(options?.server);

	const ws = await new Promise<WebSocket>((resolve) => {
		server.on("connection", (ws) => {
			resolve(ws);
		});
	});

	const ctx = {
		server,
		ws,
		options: (options || {}) as O,
		events: new Map<string, (data: any) => Promisable<void>>(),
	};

	return ctx satisfies RPCWebSocketContext;
};

export type RPCWebSocketContext = {
	server: WebSocketServer;
	ws: WebSocket;
	options: RPCWebSocketOptions;
	events: Map<string, (data: any) => Promisable<void>>;
};

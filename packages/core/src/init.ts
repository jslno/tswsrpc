import type { RPCWSOptions } from "./types/options";
import { WebSocketServer, WebSocket } from "ws";
import type { Event } from "./event";

export const init = async <O extends RPCWSOptions>(options?: O) => {
	const server = new WebSocketServer(options?.server);

	const ws = await new Promise<WebSocket>((resolve) => {
		server.on("connection", (ws) => {
			resolve(ws);
		});
	});

	const ctx = {
		server,
		ws,
		options: options || {},
		events: (options?.events || []) as Exclude<O["events"], undefined>,
	};

	return ctx satisfies RPCWSContext;
};

export type RPCWSContext = {
	server: WebSocketServer;
	ws: WebSocket;
	options: RPCWSOptions;
	events: Event[];
};

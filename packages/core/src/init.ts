import type { TSWSRPCOptions } from "./types/options";
import { WebSocketServer, WebSocket } from "ws";
import type { Promisable } from "./types/utils";
import { onMessage } from "./event";

export const init = async <O extends TSWSRPCOptions>(options?: O) => {
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

	ctx.ws.on("message", onMessage.bind(null, ctx));

	return ctx satisfies TSWSRPCContext;
};

export type TSWSRPCContext = {
	server: WebSocketServer;
	ws: WebSocket;
	options: TSWSRPCOptions;
	events: Map<string, (data: any) => Promisable<void>>;
};

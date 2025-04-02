import type { TSWSRPCOptions } from "./types/options";
import { WebSocketServer, WebSocket } from "ws";
import type { Promisable } from "./types/utils";
import { onMessage } from "./event";

export const init = async <O extends TSWSRPCOptions>(options?: O) => {
	const server = new WebSocketServer(options?.server);

	if (options?.lifecycle?.onError) {
		server.on("error", options.lifecycle.onError);
	}

	if (options?.lifecycle?.onHeaders) {
		server.on("headers", options.lifecycle.onHeaders);
	}

	if (options?.lifecycle?.onClose) {
		server.on("close", options.lifecycle.onClose);
	}

	if (options?.lifecycle?.onListening) {
		server.on("listening", options.lifecycle.onListening);
	}

	if (options?.lifecycle?.onClientError) {
		server.on("wsClientError", options.lifecycle.onClientError);
	}

	const ws = await new Promise<WebSocket>((resolve) => {
		server.on("connection", async (ws, req) => {
			resolve(ws);
			if (options?.lifecycle?.onConnection) {
				await options.lifecycle.onConnection(ws, req);
			}
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

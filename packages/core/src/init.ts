import type { TSWSRPCOptions } from "./types/options";
import { WebSocketServer, WebSocket } from "ws";
import { onMessage } from "./event";
import type { EventHandler } from "./types/events";

export const init = async <O extends TSWSRPCOptions>(options?: O) => {
	const server = new WebSocketServer(options?.server);

	initLifecycleEvents(server, options);

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
		events: new Map<string, EventHandler>(),
	};

	ctx.ws.on("message", onMessage.bind(null, ctx));

	return ctx satisfies TSWSRPCContext;
};

export type TSWSRPCContext = {
	server: WebSocketServer;
	ws: WebSocket;
	options: TSWSRPCOptions;
	events: Map<string, EventHandler>;
};

const initLifecycleEvents = (server: WebSocketServer, options: TSWSRPCOptions | undefined) => {
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
};

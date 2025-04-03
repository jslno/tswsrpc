import type WebSocket from "ws";
import type { EventHandler } from "./types/events";

export const createEmitProxy = (ctx: {
	ws: WebSocket;
}) => {
	return _createEmitProxy(ctx);
};

const _createEmitProxy = (
	ctx: {
		ws: WebSocket;
	},
	path: string = "",
) => {
	const callback = (data: any) => {
		if (ctx.ws.readyState === ctx.ws.OPEN) {
			ctx.ws.send(
				JSON.stringify({
					event: path,
					data,
				}),
			);
		}
	};

	return new Proxy(callback, {
		get(_, prop) {
			if (typeof prop !== "string") return undefined;
			return _createEmitProxy(ctx, path ? `${path}.${prop}` : prop);
		},
	});
};

export const createOnProxy = (ctx: {
	events: Map<string, EventHandler>;
}) => {
	return _createOnProxy(ctx);
};

const _createOnProxy = (
	ctx: {
		events: Map<string, EventHandler>;
	},
	path: string = "",
) => {
	const callback = (data: any) => {
		ctx.events.set(path, data);
	};

	return new Proxy(callback, {
		get(_, prop) {
			if (typeof prop !== "string") return undefined;
			return _createOnProxy(ctx, path ? `${path}.${prop}` : prop);
		},
	});
};

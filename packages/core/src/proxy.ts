import type WebSocket from "ws";

export const createProxy = (ctx: {
	ws: WebSocket;
}) => {
	return createDeepProxy(ctx);
};

const createDeepProxy = (
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
			return createDeepProxy(ctx, path ? `${path}.${prop}` : prop);
		},
	});
};

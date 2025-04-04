import WebSocket from "ws";
import type { ClientOptions } from ".";
import { onMessage } from "../event";
import type { EventHandler } from "../types/events";

export const initClient = <O extends ClientOptions>(options: O) => {
	const ws = new WebSocket(options.address, options.advanced);

	const ctx = {
		options,
		ws,
		events: new Map<string, EventHandler>(),
	};

	initLifecycleEvents(ctx);

	ctx.ws.onmessage = async ({ data }) => {
		await onMessage(ctx, data);
	};

	return ctx satisfies TSWSRPCClientContext;
};

export type TSWSRPCClientContext = {
	ws: WebSocket;
	options: ClientOptions;
	events: Map<string, EventHandler>;
};

const initLifecycleEvents = (ctx: TSWSRPCClientContext) => {
	if (ctx.options.lifecycle?.onOpen) {
		ctx.ws.onopen = ctx.options.lifecycle.onOpen;
	}

	if (ctx.options.lifecycle?.onClose) {
		ctx.ws.onclose = ctx.options.lifecycle.onClose;
	}

	if (ctx.options.lifecycle?.onError) {
		ctx.ws.onerror = ctx.options.lifecycle.onError;
	}
};

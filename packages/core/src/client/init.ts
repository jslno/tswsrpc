import WebSocket from "ws";
import type { ClientOptions } from ".";
import type { Promisable } from "../types/utils";
import { onMessage } from "../event";

export const initClient = <O extends ClientOptions>(options: O) => {
	const ws = new WebSocket(options.address, options.advanced);

	const ctx = {
		options,
		ws,
		events: new Map<string, (data: any) => Promisable<void>>(),
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
	events: Map<string, (data: any) => Promisable<void>>;
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

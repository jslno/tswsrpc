import { WebSocket } from "ws";
import { createEmitProxy, createOnProxy } from "../proxy";
import type {
	EventDefinitions,
	InferEventInputHandlers,
	InferEventOutputHandlers,
} from "../types/events";
import { eventRegistry as $eventRegistry, event as $event, onMessage } from "../event";
import { type Promisable, type Prettify } from "../types/utils";

export type ClientOptions = {
	address: string | URL;
	events?: EventDefinitions;
	advanced?: WebSocket.ClientOptions;
	lifecycle?: {
		onOpen?: (event: WebSocket.Event) => Promisable<void>;
		onError?: (event: WebSocket.ErrorEvent) => Promisable<void>;
		onClose?: (event: WebSocket.CloseEvent) => Promisable<void>;
	};
};

const _client =
	<T extends EventDefinitions = {}>() =>
	<O extends ClientOptions>(options: O) => {
		const ws = new WebSocket(options.address, options.advanced);

		const ctx = {
			options,
			ws,
			events: new Map<string, (data: any) => Promisable<void>>(),
		};

		const emit = createEmitProxy(ctx) as any as Prettify<Readonly<InferEventInputHandlers<T>>>;

		const on = createOnProxy(ctx) as any as Prettify<
			Readonly<InferEventOutputHandlers<Exclude<O["events"], undefined>>>
		>;

		if (ctx.options.lifecycle?.onOpen) {
			ctx.ws.onopen = ctx.options.lifecycle.onOpen;
		}

		if (ctx.options.lifecycle?.onClose) {
			ctx.ws.onclose = ctx.options.lifecycle.onClose;
		}

		if (ctx.options.lifecycle?.onError) {
			ctx.ws.onerror = ctx.options.lifecycle.onError;
		}

		ctx.ws.onmessage = async ({ data }) => {
			await onMessage(ctx, data);
		};

		return {
			$context: ctx,
			emit,
			on,
		};
	};
export const client = Object.assign(_client, {
	$eventRegistry,
	$event,
});

export type { EventDefinitions } from "../types/events";

import { WebSocket } from "ws";
import { createEmitProxy, createOnProxy } from "../proxy";
import type {
	EventDefinitions,
	InferEventInputHandlers,
	InferEventOutputHandlers,
} from "../types/events";
import { eventRegistry as $eventRegistry, event as $event } from "../event";
import { type Promisable, type Prettify } from "../types/utils";
import { initClient } from "./init";

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
		const ctx = initClient(options);

		const emit = createEmitProxy(ctx) as any as Prettify<Readonly<InferEventInputHandlers<T>>>;

		const on = createOnProxy(ctx) as any as Prettify<
			Readonly<InferEventOutputHandlers<Exclude<O["events"], undefined>>>
		>;

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

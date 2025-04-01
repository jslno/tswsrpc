import { WebSocket } from "ws";
import { createEmitProxy, createOnProxy } from "../proxy";
import type {
	EventDefinitions,
	InferEventInputHandlers,
	InferEventOutputHandlers,
} from "../types/events";
import { eventRegistry as $eventRegistry } from "../event";
import { type Promisable, type Prettify } from "../types/utils";
import { standardValidate } from "../utils/standard-schema";

type ClientOptions = {
	address: string | URL;
	events?: EventDefinitions;
	advanced?: WebSocket.ClientOptions;
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

		ctx.ws.onmessage = async ({ data }) => {
			const body = JSON.parse(data.toString("utf-8"));

			if ("event" in body) {
				const handler = ctx.events.get(body.event);
				const type = ctx.options.events?.[body.event];

				if (!!handler) {
					await handler(type ? await standardValidate(type, body.data) : body.data);
				}
			}
		};

		return {
			$context: ctx,
			emit,
			on,
		};
	};
export const client = Object.assign(_client, {
	$eventRegistry,
});

export type { EventDefinitions } from "../types/events";

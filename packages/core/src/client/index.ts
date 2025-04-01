import { WebSocket } from "ws";
import { createProxy } from "../proxy";
import { event as $event, forwardEvents as $forwardEvents } from "../event";
import type { InferEventHandlers, Event } from "../types/events";
import { standardValidate } from "../utils/standard-schema";

type ClientOptions = {
	address: string | URL;
	events?: Event[];
	advanced?: WebSocket.ClientOptions;
};

const _client =
	<
		T extends Event[] & {
			__brand: "events";
		},
	>() =>
	<O extends ClientOptions>(options: O) => {
		const ws = new WebSocket(options.address, options.advanced);

		const ctx = {
			options,
			ws,
			events: (options.events || []) as Exclude<O["events"], undefined>,
		};

		const emit = createProxy(ctx) as any as InferEventHandlers<T>;

		ctx.ws.onmessage = async ({ data }) => {
			const body = JSON.parse(data.toString("utf-8"));

			if ("event" in body) {
				const events = ctx.events.filter((val) => val.id === body.event);

				await Promise.all(
					events.map((e) =>
						e.handler(e.type ? standardValidate(e.type, body.data) : body.data, {
							emit,
						}),
					),
				);
			}
		};

		return {
			$context: ctx,
			emit,
		};
	};
export const client = Object.assign(_client, {
	$event,
	$forwardEvents,
});

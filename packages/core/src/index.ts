import type { TSWSRPCOptions } from "./types/options";
import { init } from "./init";
import { createEmitProxy, createOnProxy } from "./proxy";
import { standardValidate } from "./utils/standard-schema";
import type { Prettify } from "./types/utils";
import type {
	EventDefinitions,
	InferEventInputHandlers,
	InferEventOutputHandlers,
} from "./types/events";
import { eventRegistry as $eventRegistry, event as $event } from "./event";

const _tswsrpc =
	<T extends EventDefinitions = {}>() =>
	async <O extends TSWSRPCOptions>(options?: O) => {
		const ctx = await init(options);

		const emit = createEmitProxy(ctx) as any as Prettify<Readonly<InferEventInputHandlers<T>>>;

		const on = createOnProxy(ctx) as any as Prettify<
			Readonly<InferEventOutputHandlers<Exclude<O["events"], undefined>>>
		>;

		ctx.ws.on("message", async (message) => {
			const body = JSON.parse(message.toString("utf-8"));

			if ("event" in body) {
				const handler = ctx.events.get(body.event);
				const def = ctx.options.events?.[body.event];

				let eventData = body.data;
				if (def?.use) {
					const middlewares = Array.isArray(def.use) ? def.use : [def.use];

					for (const middleware of middlewares) {
						const res = await middleware(eventData);

						if (!!res) {
							eventData = res;
						}
					}
				}

				if (!!handler) {
					await handler(
						def?.type ? await standardValidate(def?.type, eventData) : eventData,
					);
				}
			}
		});

		ctx.ws.on("close", () => console.log("Client disconnected"));

		return {
			$context: ctx,
			emit,
			on,
		};
	};
export const tswsrpc = Object.assign(_tswsrpc, {
	$eventRegistry,
	$event,
});

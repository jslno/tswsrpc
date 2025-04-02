import type { WSRPCOptions } from "./types/options";
import { init } from "./init";
import { createEmitProxy, createOnProxy } from "./proxy";
import { standardValidate } from "./utils/standard-schema";
import type { Prettify } from "./types/utils";
import type {
	EventDefinitions,
	InferEventInputHandlers,
	InferEventOutputHandlers,
} from "./types/events";
import { eventRegistry as $eventRegistry } from "./event";

const _wsrpc =
	<T extends EventDefinitions = {}>() =>
	async <O extends WSRPCOptions>(options?: O) => {
		const ctx = await init(options);

		const emit = createEmitProxy(ctx) as any as Prettify<Readonly<InferEventInputHandlers<T>>>;

		const on = createOnProxy(ctx) as any as Prettify<
			Readonly<InferEventOutputHandlers<Exclude<O["events"], undefined>>>
		>;

		ctx.ws.on("message", async (message) => {
			const body = JSON.parse(message.toString("utf-8"));

			if ("event" in body) {
				const handler = ctx.events.get(body.event);
				const type = ctx.options.events?.[body.event];

				if (!!handler) {
					await handler(type ? await standardValidate(type, body.data) : body.data);
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
export const wsrpc = Object.assign(_wsrpc, {
	$eventRegistry,
});

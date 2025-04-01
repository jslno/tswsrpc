import { event as $event, forwardEvents as $forwardEvents } from "./event";
import type { RPCWSOptions } from "./types/options";
import { init } from "./init";
import { createProxy } from "./proxy";
import type { InferEventHandlers, Event } from "./types/events";
import { standardValidate } from "./utils/standard-schema";

const _rpcws =
	<
		T extends Event[] & {
			__brand: "events";
		},
	>() =>
	async <O extends RPCWSOptions>(options?: O) => {
		const ctx = await init(options);

		const emit = createProxy(ctx) as any as InferEventHandlers<T>;

		ctx.ws.on("message", async (message) => {
			const body = JSON.parse(message.toString("utf-8"));

			if ("event" in body) {
				const events = ctx.events.filter((val) => val.id === body.event);

				await Promise.all(
					events.map(async (e) =>
						e.handler(e.type ? standardValidate(e.type, body.data) : body.data, {
							emit,
						}),
					),
				);
			}
		});

		ctx.ws.on("close", () => console.log("Client disconnected"));

		return {
			$context: ctx,
			emit,
		};
	};
export const rpcws = Object.assign(_rpcws, {
	$event,
	$forwardEvents,
});

import type { TSWSRPCOptions } from "./types/options";
import { init } from "./init";
import { createEmitProxy, createOnProxy } from "./proxy";
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

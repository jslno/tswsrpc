import type { Data } from "ws";
import type {
	EventDefinitions,
	EventHandler,
	EventMiddleware,
	EventHandlerContext,
	InferEventOutputType,
} from "./types/events";
import type { Promisable } from "./types/utils";
import { standardValidate } from "./utils/standard-schema";
import { TSWSRPCError } from "./error";

export const eventRegistry = <T extends EventDefinitions>(defs: T): T => defs;

export const event = <
	T extends EventDefinitions[keyof EventDefinitions]["type"],
	D extends {
		type?: T;
		use?:
			| ((data: any) => Promisable<InferEventOutputType<T> | void>)
			| ((data: any) => Promisable<InferEventOutputType<T> | void>)[];
	},
>(
	def: D,
) => def satisfies EventDefinitions[keyof EventDefinitions];

export const runMiddlewares = async (
	ctx: EventHandlerContext,
	middlewares?: EventMiddleware | EventMiddleware[],
) => {
	let data = ctx.data;
	if (middlewares) {
		const middlewaresArr = Array.isArray(middlewares) ? middlewares : [middlewares];

		for (const middleware of middlewaresArr) {
			const res = await middleware({
				...ctx,
				data,
			});
			if (!!res) {
				data = res;
			}
		}
	}

	return data;
};

export const createEventHandlerCtx = <T>(data: T) =>
	({
		data,
		error: (message: string) => {
			throw new TSWSRPCError(message);
		},
	}) satisfies EventHandlerContext;

export const onMessage = async (
	ctx: {
		events: Map<string, EventHandler>;
		options: {
			events?: EventDefinitions;
		};
	},
	data: Data,
) => {
	const body = JSON.parse(data.toString("utf-8"));

	if ("event" in body) {
		const handler = ctx.events.get(body.event);
		const def = ctx.options.events?.[body.event];

		if (!!handler) {
			try {
				let eventData = def?.type ? await standardValidate(def.type, body.data) : body.data;
				eventData = await runMiddlewares(createEventHandlerCtx(eventData), def?.use);

				await handler(createEventHandlerCtx(eventData), undefined);
			} catch (err) {
				await handler(createEventHandlerCtx(undefined), err);
			}
		}
	}
};

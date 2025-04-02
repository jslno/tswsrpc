import type { Data } from "ws";
import type { EventDefinitions, EventMiddleware, InferEventOutputType } from "./types/events";
import type { Promisable } from "./types/utils";
import { standardValidate } from "./utils/standard-schema";

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
	data: any,
	middlewares?: EventMiddleware | EventMiddleware[],
) => {
	if (middlewares) {
		const middlewaresArr = Array.isArray(middlewares) ? middlewares : [middlewares];

		for (const middleware of middlewaresArr) {
			const res = await middleware(data);
			if (!!res) {
				data = res;
			}
		}
	}

	return data;
};

export const onMessage = async (
	ctx: {
		events: Map<string, (data: any) => Promisable<void>>;
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

		let eventData = await runMiddlewares(body.data, def?.use);

		if (!!handler) {
			await handler(def?.type ? await standardValidate(def.type, eventData) : eventData);
		}
	}
};

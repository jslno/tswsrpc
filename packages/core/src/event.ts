import type { EventDefinitions } from "./client";
import type { InferEventOutputType } from "./types/events";
import type { Promisable } from "./types/utils";

export const eventRegistry = <T extends EventDefinitions>(defs: T): T => defs;

export const event = <
	T extends EventDefinitions[keyof EventDefinitions]["type"],
	D extends EventDefinitions[keyof EventDefinitions] & { type?: T },
>(
	def: D & {
		type?: T;
		use?:
			| ((data: any) => Promisable<InferEventOutputType<T> | void>)
			| ((data: any) => Promisable<InferEventOutputType<T> | void>)[];
	},
): D => def;

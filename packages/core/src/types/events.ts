import type { StandardSchemaV1 } from "../utils/standard-schema";
import type { LiteralString, Prettify, Promisable, UnionToIntersection } from "./utils";

type PathToObject<T extends string, Value = any> = T extends `${infer Key}.${infer Rest}`
	? { [K in Key]: PathToObject<Rest, Value> }
	: { [K in T]: Value };

export type InferEventHandlers<T extends Event[]> = Prettify<
	UnionToIntersection<
		T extends Array<infer I extends Event>
			? PathToObject<I["id"], InferEventInputHandler<I>>
			: {}
	>
>;

export type EventOptions = {
	id: LiteralString;
	type?: StandardSchemaV1;
};

export type InferEventInputType<T> = T extends StandardSchemaV1
	? StandardSchemaV1.InferInput<T>
	: undefined;
export type InferEventOutputType<T> = T extends StandardSchemaV1
	? StandardSchemaV1.InferOutput<T>
	: undefined;

export type InferEventOutputHandler<T extends EventOptions> = (
	data: InferEventOutputType<T["type"]>,
	ctx: { emit: any },
) => Promisable<void>;

export type InferEventInputHandler<T extends EventOptions> = undefined extends InferEventInputType<
	T["type"]
>
	? (data?: InferEventInputType<T["type"]>) => Promisable<void>
	: (data: InferEventInputType<T["type"]>) => Promisable<void>;

export type Event = {
	id: LiteralString;
	type?: StandardSchemaV1;
	handler: (data: any, ctx: { emit: any }) => Promise<any> | any;
};

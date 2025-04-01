import type { StandardSchemaV1 } from "../utils/standard-schema";
import type { Prettify, Promisable, UnionToIntersection } from "./utils";

export type EventDefinitions = {
	[key: string]: StandardSchemaV1 | null | undefined;
};

type _InferEventInputHandlers<T extends EventDefinitions> = {
	[K in keyof T]: K extends `${infer First}.${infer Rest}`
		? { [key in First]: _InferEventInputHandlers<{ [key in Rest]: T[K] }> }
		: { [key in K]: InferEventInputHandler<T[K]> };
}[keyof T];

export type InferEventInputHandlers<T extends EventDefinitions> = Prettify<
	UnionToIntersection<_InferEventInputHandlers<T>>
>;

export type InferEventInputHandler<T extends EventDefinitions[keyof EventDefinitions]> =
	T extends StandardSchemaV1
		? undefined extends StandardSchemaV1.InferInput<T>
			? (data?: StandardSchemaV1.InferInput<T>) => Promisable<void>
			: (data: StandardSchemaV1.InferInput<T>) => Promisable<void>
		: () => Promisable<void>;

type _InferEventOutputHandlers<T extends EventDefinitions> = {
	[K in keyof T]: K extends `${infer First}.${infer Rest}`
		? { [key in First]: _InferEventOutputHandlers<{ [key in Rest]: T[K] }> }
		: { [key in K]: InferEventOutputHandler<T[K]> };
}[keyof T];

export type InferEventOutputHandlers<T extends EventDefinitions> = Prettify<
	UnionToIntersection<_InferEventOutputHandlers<T>>
>;

export type InferEventOutputHandler<T extends EventDefinitions[keyof EventDefinitions]> = (
	cb: InferEventOutputHandlerCallback<T>,
) => void;

export type InferEventOutputHandlerCallback<T extends EventDefinitions[keyof EventDefinitions]> =
	T extends StandardSchemaV1
		? (data: StandardSchemaV1.InferOutput<T>) => Promisable<void>
		: () => Promisable<void>;

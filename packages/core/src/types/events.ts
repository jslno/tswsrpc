import type { StandardSchemaV1 } from "../utils/standard-schema";
import type { Prettify, Promisable, UnionToIntersection } from "./utils";

export type EventMiddleware = (data: any) => Promisable<any>;

export type EventHandler = (data: any, error: any) => Promisable<void>;

export type EventDefinitions = {
	[key: string]: {
		type?: StandardSchemaV1 | null | undefined;
		use?: EventMiddleware | EventMiddleware[];
	};
};

type _InferEventInputHandlers<T extends EventDefinitions> = {
	[K in keyof T]: K extends `${infer First}.${infer Rest}`
		? { [key in First]: _InferEventInputHandlers<{ [key in Rest]: T[K] }> }
		: { [key in K]: InferEventInputHandler<T[K]> };
}[keyof T];

export type InferEventInputHandlers<T extends EventDefinitions> = Prettify<
	UnionToIntersection<_InferEventInputHandlers<T>>
>;

export type InferEventInputType<T extends EventDefinitions[keyof EventDefinitions]["type"]> =
	T extends StandardSchemaV1 ? StandardSchemaV1.InferInput<T> : undefined;

export type InferEventOutputType<T extends EventDefinitions[keyof EventDefinitions]["type"]> =
	T extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<T> : undefined;

export type InferEventInputHandler<T extends EventDefinitions[keyof EventDefinitions]> =
	undefined extends InferEventInputType<T["type"]>
		? (data?: InferEventInputType<T["type"]>) => Promisable<void>
		: (data: InferEventInputType<T["type"]>) => Promisable<void>;

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

export type InferEventOutputHandlerCallback<T extends EventDefinitions[keyof EventDefinitions]> = (
	data?: T["type"] extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<T["type"]> : undefined,
	error?: any,
) => Promisable<void>;

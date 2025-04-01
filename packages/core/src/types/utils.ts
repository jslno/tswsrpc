export type LiteralString = "" | (string & Record<never, never>);

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type UnionToIntersection<U> = (
	U extends unknown
		? (distributedUnion: U) => void
		: never
) extends (mergedIntersection: infer I) => void
	? I & U
	: never;

export type Promisable<T> = Promise<T> | T
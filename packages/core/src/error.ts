export class TSWSRPCError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TSWSRPCError";
		this.stack = "";
	}
}

export class EmailError extends Error {
	readonly provider: string;
	readonly status?: number;
	readonly body?: string;

	constructor(
		message: string,
		options?: {
			provider: string;
			status?: number;
			body?: string;
			cause?: unknown;
		},
	) {
		super(message, { cause: options?.cause });
		this.name = "EmailError";
		this.provider = options?.provider ?? "unknown";
		this.status = options?.status;
		this.body = options?.body;
	}
}

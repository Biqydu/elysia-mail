export interface Attachment {
	filename: string;
	content: string | Uint8Array | Buffer;
	contentType?: string;
	cid?: string;
}

export interface SendMailArgs {
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
	from?: string;
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string | string[];
	attachments?: Attachment[];
	headers?: Record<string, string>;
}

export type MailPluginOptions =
	| {
			provider: "resend";
			apiKey: string;
			from: string;
	  }
	| {
			provider: "mailgun";
			apiKey: string;
			from: string;
			domain: string;
			region?: "us" | "eu";
	  };

export type ProviderFn = (
	options: MailPluginOptions,
	args: SendMailArgs,
) => Promise<unknown>;

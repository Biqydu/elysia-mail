import { EmailError } from "../error";
import type { ProviderFn } from "../types";

const toArray = (value?: string | string[]) =>
	value == null ? [] : Array.isArray(value) ? value : [value];

const toBase64 = (content: string | Uint8Array | Buffer) => {
	if (typeof content === "string") return content;
	return Buffer.from(content).toString("base64");
};

export const resendProvider: ProviderFn = async (options, args) => {
	if (options.provider !== "resend") {
		throw new EmailError("Invalid provider options for Resend", {
			provider: "resend",
		});
	}

	const body: Record<string, unknown> = {
		from: args.from ?? options.from,
		to: toArray(args.to),
		subject: args.subject,
	};

	if (args.html) body.html = args.html;
	if (args.text) body.text = args.text;

	const cc = toArray(args.cc);
	if (cc.length) body.cc = cc;

	const bcc = toArray(args.bcc);
	if (bcc.length) body.bcc = bcc;

	const replyTo = toArray(args.replyTo);
	if (replyTo.length) body.reply_to = replyTo;

	if (args.headers) body.headers = args.headers;

	if (args.attachments?.length) {
		body.attachments = args.attachments.map((file) => ({
			filename: file.filename,
			content: toBase64(file.content),
			...(file.contentType ? { content_type: file.contentType } : {}),
			...(file.cid ? { content_id: file.cid } : {}),
		}));
	}

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${options.apiKey}`,
			"Content-Type": "application/json",
			"User-Agent": "elysia-email",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const responseBody = await response.text();
		throw new EmailError("Resend request failed", {
			provider: "resend",
			status: response.status,
			body: responseBody,
		});
	}

	return response.json();
};

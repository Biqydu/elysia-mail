import { EmailError } from "../error";
import type { ProviderFn } from "../types";

const toArray = (value?: string | string[]) =>
	value == null ? [] : Array.isArray(value) ? value : [value];

export const mailgunProvider: ProviderFn = async (options, args) => {
	if (options.provider !== "mailgun") {
		throw new EmailError("Invalid provider options for Mailgun", {
			provider: "mailgun",
		});
	}

	if (!options.domain) {
		throw new EmailError('Mailgun requires "domain"', {
			provider: "mailgun",
		});
	}

	const baseApiUrl =
		options.region === "eu"
			? "https://api.eu.mailgun.net"
			: "https://api.mailgun.net";

	const formData = new FormData();

	formData.append("from", args.from ?? options.from);
	formData.append("subject", args.subject);

	if (args.html) formData.append("html", args.html);
	if (args.text) formData.append("text", args.text);

	for (const to of toArray(args.to)) {
		formData.append("to", to);
	}

	for (const cc of toArray(args.cc)) {
		formData.append("cc", cc);
	}

	for (const bcc of toArray(args.bcc)) {
		formData.append("bcc", bcc);
	}

	const replyTo = toArray(args.replyTo);
	if (replyTo.length > 0) {
		formData.append("h:Reply-To", replyTo.join(", "));
	}

	if (args.headers) {
		for (const [key, value] of Object.entries(args.headers)) {
			formData.append(`h:${key}`, value);
		}
	}

	if (args.attachments) {
		for (const file of args.attachments) {
			const bytes =
				typeof file.content === "string"
					? Buffer.from(file.content, "base64")
					: file.content;

			const blob = new Blob([bytes], {
				type: file.contentType ?? "application/octet-stream",
			});

			if (file.cid) {
				formData.append("inline", blob, file.filename);
			} else {
				formData.append("attachment", blob, file.filename);
			}
		}
	}

	const encoded = Buffer.from(`api:${options.apiKey}`).toString("base64");

	const response = await fetch(`${baseApiUrl}/v3/${options.domain}/messages`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${encoded}`,
		},
		body: formData,
	});

	if (!response.ok) {
		const responseBody = await response.text();
		throw new EmailError("Mailgun request failed", {
			provider: "mailgun",
			status: response.status,
			body: responseBody,
		});
	}

	return response.json();
};

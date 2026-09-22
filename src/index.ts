import Elysia from "elysia";
import { EmailError } from "./error";
import { mailgunProvider } from "./providers/mailgun";
import { resendProvider } from "./providers/resend";
import type { MailPluginOptions, ProviderFn, SendMailArgs } from "./types";

const mailProviders: Record<MailPluginOptions["provider"], ProviderFn> = {
	resend: resendProvider,
	mailgun: mailgunProvider,
};

export const email = (options: MailPluginOptions) => {
	const sendEmail = async (args: SendMailArgs) => {
		if (!args.html && !args.text) {
			throw new EmailError("Either html or text is required", {
				provider: options.provider,
			});
		}

		const providerFn = mailProviders[options.provider];

		if (!providerFn) {
			throw new EmailError(`Provider "${options.provider}" is not supported`, {
				provider: options.provider,
			});
		}

		return providerFn(options, args);
	};

	return new Elysia({ name: "elysia-email" }).decorate("sendEmail", sendEmail);
};

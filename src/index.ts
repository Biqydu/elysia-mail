import Elysia from "elysia";
import { mailgunProvider } from "./providers/mailgun";
import { resendProvider } from "./providers/resend";
import type { MailPluginOptions, ProviderFn, SendMailArgs } from "./types";

const mailProviders: Record<MailPluginOptions["provider"], ProviderFn> = {
	resend: resendProvider,
	mailgun: mailgunProvider,
};

export const email = (options: MailPluginOptions) => {
	const sendEmail = async (args: SendMailArgs) => {
		const providerFn = mailProviders[options.provider];

		if (!providerFn)
			throw new Error(`Provider "${options.provider} is not supported"`);

		return providerFn(options, args);
	};

	return new Elysia({ name: "elysia-email" }).decorate("sendEmail", sendEmail);
};

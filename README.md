# elysia-email

Simple, typed email sending plugin for [Elysia](https://elysiajs.com).

Supports multiple providers behind one API so you can switch between them without changing your application code.

## Features

- Multi-provider support (Resend, Mailgun)
- Shared, typed `sendEmail` API
- Works with Bun + Elysia
- Supports HTML / text, CC, BCC, Reply-To, headers, and attachments
- Zero provider SDKs — lightweight `fetch`-based implementations

## Installation

```bash
bun add @biqydu/elysia-email
```

Peer dependency:

```bash
bun add elysia
```

## Quick start

```ts
import { Elysia } from "elysia";
import { email } from "@biqydu/elysia-email";

const app = new Elysia()
  .use(
    email({
      provider: "resend",
      apiKey: process.env.RESEND_API_KEY!,
      from: "Acme <onboarding@resend.dev>",
    }),
  )
  .post("/send", async ({ sendEmail }) => {
    await sendEmail({
      to: "user@example.com",
      subject: "Hello from elysia-email",
      html: "<h1>It works</h1>",
      text: "It works",
    });

    return { success: true };
  })
  .listen(3000);
```

## Configuration

### Resend

```ts
email({
  provider: "resend",
  apiKey: process.env.RESEND_API_KEY!,
  from: "Acme <onboarding@resend.dev>",
});
```

### Mailgun

```ts
email({
  provider: "mailgun",
  apiKey: process.env.MAILGUN_API_KEY!,
  from: "Acme <noreply@mg.example.com>",
  domain: "mg.example.com",
  region: "us", // or "eu"
});
```

| Option     | Type                    | Required | Description                      |
| ---------- | ----------------------- | -------- | -------------------------------- |
| `provider` | `"resend" \| "mailgun"` | Yes      | Email provider                   |
| `apiKey`   | `string`                | Yes      | Provider API key                 |
| `from`     | `string`                | Yes      | Default sender address           |
| `domain`   | `string`                | Mailgun  | Mailgun sending domain           |
| `region`   | `"us" \| "eu"`          | No       | Mailgun region (default: `"us"`) |

## `sendEmail` options

```ts
await sendEmail({
  to: "user@example.com",
  // or: ["a@example.com", "b@example.com"]
  subject: "Welcome",
  html: "<p>Hello</p>",
  text: "Hello",
  from: "Override <noreply@example.com>", // optional
  cc: "manager@example.com",
  bcc: ["archive@example.com"],
  replyTo: "support@example.com",
  headers: {
    "X-Campaign": "welcome",
  },
  attachments: [
    {
      filename: "invoice.pdf",
      content: pdfBase64OrBytes,
      contentType: "application/pdf",
    },
  ],
});
```

| Field         | Type                     | Required | Description              |
| ------------- | ------------------------ | -------- | ------------------------ |
| `to`          | `string \| string[]`     | Yes      | Recipient(s)             |
| `subject`     | `string`                 | Yes      | Email subject            |
| `html`        | `string`                 | No*      | HTML body                |
| `text`        | `string`                 | No*      | Plain text body          |
| `from`        | `string`                 | No       | Overrides default `from` |
| `cc`          | `string \| string[]`     | No       | Carbon copy              |
| `bcc`         | `string \| string[]`     | No       | Blind carbon copy        |
| `replyTo`     | `string \| string[]`     | No       | Reply-To address(es)     |
| `headers`     | `Record<string, string>` | No       | Custom email headers     |
| `attachments` | `Attachment[]`           | No       | File attachments         |

\* At least one of `html` or `text` is required.

### Attachment shape

```ts
interface Attachment {
  filename: string;
  content: string | Uint8Array | Buffer; // base64 string or binary
  contentType?: string;
  cid?: string; // for inline images
}
```

## Examples

### Multiple recipients

```ts
await sendEmail({
  to: ["alice@example.com", "bob@example.com"],
  cc: "team@example.com",
  subject: "Project update",
  html: "<p>Status report attached.</p>",
});
```

### Attachment

```ts
import { readFileSync } from "node:fs";

await sendEmail({
  to: "user@example.com",
  subject: "Your invoice",
  html: "<p>Please find your invoice attached.</p>",
  attachments: [
    {
      filename: "invoice.pdf",
      content: readFileSync("./invoice.pdf"),
      contentType: "application/pdf",
    },
  ],
});
```

### Switching providers

Keep the same `sendEmail` calls and only change plugin config:

```ts
// Development
email({
  provider: "resend",
  apiKey: process.env.RESEND_API_KEY!,
  from: "Dev <onboarding@resend.dev>",
});

// Production
email({
  provider: "mailgun",
  apiKey: process.env.MAILGUN_API_KEY!,
  from: "Acme <noreply@mg.example.com>",
  domain: "mg.example.com",
  region: "eu",
});
```

## Notes

- Use a verified domain for production sending.

## License

MIT

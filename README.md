# Bank File Tool Statement Review MCP

Local checks for a bank statement export. This is a companion to [Bank File Tool — Bank Statement Converter](https://bankfiletool.com/), which converts PDF, PNG, and JPG statements to CSV, Excel, or JSON and provides its own balance checks.

This open-source MCP server adds three small tools:

- `reconcile_statement_totals`: compare **opening balance + credits − debits** with the printed closing balance using exact cent arithmetic.
- `review_export_headers`: check that export column names include a date, description, and amount or separate debit/credit fields.
- `get_official_links`: find the official converter, pricing, contact, and privacy pages.

The checks run on your machine. Supply **totals and column names only**. Do not paste account numbers, transaction rows, statements, or other private financial data into a model prompt. This server does not access Bank File Tool accounts, upload files, call an unpublished conversion API, or prove that extracted data matches an original statement. Review flagged differences against the source PDF or image.

## Run

Requires Node.js 20.18.1 or newer.

```sh
npm ci
npm run build
npm test
node dist/index.js
```

The final command starts a stdio MCP server. Configure your MCP client to run `node /absolute/path/to/bankfiletool-statement-review-mcp/dist/index.js` after installation. For an example balance check, pass `openingBalance: "12480.20"`, `creditTotal: "8350.00"`, `debitTotal: "6912.47"`, and `closingBalance: "13917.73"` to `reconcile_statement_totals`.

## Scope

This project is independently maintained as a public helper for the [Bank File Tool](https://bankfiletool.com/) workflow. The converter itself runs on the official site. No network request is made by this MCP server.

Licensed under MIT; see `LICENSE`.

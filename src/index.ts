import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { OFFICIAL_LINKS, reconcileStatement, reviewHeaders } from './review.js';

const reply = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] });

function createServer(): McpServer {
const server = new McpServer({ name: 'bankfiletool-statement-review', version: '0.1.0' });

server.registerTool('reconcile_statement_totals', {
  title: 'Reconcile statement totals',
  description: 'Locally check opening balance + credits - debits against printed closing balance. Enter totals only; do not provide account numbers or statement files.',
  inputSchema: z.object({
    openingBalance: z.string().max(40),
    creditTotal: z.string().max(40),
    debitTotal: z.string().max(40),
    closingBalance: z.string().max(40),
  }),
}, async (input) => {
  try { return reply(reconcileStatement(input)); }
  catch (error) { return { ...reply({ error: error instanceof Error ? error.message : String(error) }), isError: true }; }
});

server.registerTool('review_export_headers', {
  title: 'Review export headers',
  description: 'Locally inspect column names from a CSV or spreadsheet export. Supply headers only, never transaction rows or account details.',
  inputSchema: z.object({ headers: z.array(z.string().max(120)).min(1).max(40) }),
}, async ({ headers }) => reply(reviewHeaders(headers)));

server.registerTool('get_official_links', {
  title: 'Get Bank File Tool links',
  description: 'Return official converter, pricing, contact, and privacy pages. This MCP server does not upload or convert statements.',
  inputSchema: z.object({}),
}, async () => reply(OFFICIAL_LINKS));

return server;
}

void serveStdio(createServer);

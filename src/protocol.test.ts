import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

test('MCP client lists and calls the server', async () => {
  const client = new Client({ name: 'bankfiletool-smoke-test', version: '0.1.0' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [fileURLToPath(new URL('./index.js', import.meta.url))] }));
  try {
    const names = (await client.listTools()).tools.map((tool) => tool.name).sort();
    assert.deepEqual(names, ['get_official_links', 'reconcile_statement_totals', 'review_export_headers']);
    const result = await client.callTool({ name: 'reconcile_statement_totals', arguments: { openingBalance: '5', creditTotal: '2', debitTotal: '1', closingBalance: '6' } });
    assert.equal(result.isError, undefined);
    const output = result.content[0];
    assert.equal(output.type, 'text');
    if (output.type === 'text') assert.equal(JSON.parse(output.text).matches, true);
  } finally { await client.close(); }
});

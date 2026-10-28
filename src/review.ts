export const OFFICIAL_LINKS = {
  converter: 'https://bankfiletool.com/',
  pricing: 'https://bankfiletool.com/pricing',
  contact: 'https://bankfiletool.com/contact',
  privacy: 'https://bankfiletool.com/privacy',
} as const;

function cents(value: string, allowNegative: boolean): bigint {
  const trimmed = value.trim();
  if (!/^-?(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(trimmed)) {
    throw new Error('Amounts must be plain decimal strings with at most two decimal places.');
  }
  if (!allowNegative && trimmed.startsWith('-')) throw new Error('Credit and debit totals cannot be negative.');
  const negative = trimmed.startsWith('-');
  const [whole, fraction = ''] = trimmed.replace('-', '').split('.');
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return negative ? -result : result;
}

function amount(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}

export function reconcileStatement(input: {
  openingBalance: string;
  creditTotal: string;
  debitTotal: string;
  closingBalance: string;
}) {
  const opening = cents(input.openingBalance, true);
  const credits = cents(input.creditTotal, false);
  const debits = cents(input.debitTotal, false);
  const printed = cents(input.closingBalance, true);
  const calculated = opening + credits - debits;
  const difference = calculated - printed;
  return {
    formula: 'opening balance + credits - debits = calculated closing balance',
    calculatedClosingBalance: amount(calculated),
    printedClosingBalance: amount(printed),
    difference: amount(difference),
    matches: difference === 0n,
    note: difference === 0n ? 'Totals match. Still compare extracted rows with the original statement.' : 'Totals differ. Review missing, duplicated, or mis-signed transactions against the original statement.',
  };
}

const FIELDS = {
  date: /(?:^|\b)(date|posted|posting|transaction date|value date)(?:\b|$)/i,
  description: /(?:description|details|memo|narrative|payee|merchant)/i,
  debit: /(?:debit|withdrawal|money out|outflow)/i,
  credit: /(?:credit|deposit|money in|inflow)/i,
  amount: /(?:^|\b)(amount|transaction amount)(?:\b|$)/i,
  balance: /(?:balance|running total)/i,
};

export function reviewHeaders(headers: string[]) {
  const clean = headers.map((header) => header.trim()).filter(Boolean);
  const detected = Object.fromEntries(Object.entries(FIELDS).map(([field, pattern]) => [field, clean.filter((header) => pattern.test(header))]));
  const has = (field: keyof typeof FIELDS) => (detected[field] as string[]).length > 0;
  const missing: string[] = [];
  if (!has('date')) missing.push('transaction date');
  if (!has('description')) missing.push('description or payee');
  if (!(has('amount') || (has('debit') && has('credit')))) missing.push('amount, or separate debit and credit columns');
  return {
    columns: clean,
    detected,
    missing,
    readyForReview: missing.length === 0,
    checks: [
      'Compare a few rows, including the first and last transactions, with the original statement.',
      'Check debit/credit signs and the opening-to-closing balance arithmetic.',
      'Keep the source statement available for verification; this header check cannot prove extraction accuracy.',
    ],
  };
}

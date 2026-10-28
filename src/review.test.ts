import assert from 'node:assert/strict';
import test from 'node:test';
import { reconcileStatement, reviewHeaders } from './review.js';

test('reconciles exact cents without floating-point drift', () => {
  const result = reconcileStatement({ openingBalance: '12480.20', creditTotal: '8350.00', debitTotal: '6912.47', closingBalance: '13917.73' });
  assert.equal(result.matches, true);
  assert.equal(result.difference, '0.00');
});

test('flags a nine-unit statement difference', () => {
  const result = reconcileStatement({ openingBalance: '12480.20', creditTotal: '8350', debitTotal: '6903.47', closingBalance: '13917.73' });
  assert.equal(result.matches, false);
  assert.equal(result.difference, '9.00');
});

test('accepts negative balances but rejects negative debit totals', () => {
  assert.equal(reconcileStatement({ openingBalance: '-10.00', creditTotal: '12.00', debitTotal: '1.00', closingBalance: '1.00' }).matches, true);
  assert.throws(() => reconcileStatement({ openingBalance: '0', creditTotal: '0', debitTotal: '-1', closingBalance: '1' }));
});

test('checks useful export columns', () => {
  assert.equal(reviewHeaders(['Transaction Date', 'Description', 'Debit', 'Credit', 'Balance']).readyForReview, true);
  assert.deepEqual(reviewHeaders(['Date', 'Memo']).missing, ['amount, or separate debit and credit columns']);
});

import { describe, expect, it } from 'vitest';
import { parseContactPayload } from './contact';

describe('parseContactPayload', () => {
  it('normalizes a valid payload', () => {
    expect(parseContactPayload({ name: '  Ana  ', email: ' ANA@EXAMPLE.COM ', message: ' Olá ', lang: 'en' })).toEqual({
      success: true,
      data: { name: 'Ana', email: 'ana@example.com', message: 'Olá', lang: 'en', isBot: false },
    });
  });

  it.each([
    [null, 'invalid_body'],
    [{}, 'invalid_types'],
    [{ name: 'Ana', email: 'invalido', message: 'Oi' }, 'invalid_email'],
    [{ name: ' ', email: 'ana@example.com', message: 'Oi' }, 'missing_fields'],
    [{ name: 'Ana', email: 'ana@example.com', message: 'x'.repeat(5_001) }, 'too_long'],
  ])('rejects invalid input', (payload, error) => {
    expect(parseContactPayload(payload)).toEqual({ success: false, error });
  });

  it('marks the honeypot as bot activity', () => {
    const result = parseContactPayload({ name: 'Bot', email: 'bot@example.com', message: 'Oi', website: 'spam' });
    expect(result.success && result.data.isBot).toBe(true);
  });
});

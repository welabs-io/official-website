export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  message: 5_000,
} as const;

export type ContactData = {
  name: string;
  email: string;
  message: string;
  lang: 'pt' | 'en';
  isBot: boolean;
};

export type ContactParseResult =
  | { success: true; data: ContactData }
  | { success: false; error: 'invalid_body' | 'invalid_types' | 'missing_fields' | 'invalid_email' | 'too_long' };

export function parseContactPayload(body: unknown): ContactParseResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { success: false, error: 'invalid_body' };
  }

  const { name, email, message, lang, website } = body as Record<string, unknown>;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return { success: false, error: 'invalid_types' };
  }

  const data: ContactData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    lang: lang === 'en' ? 'en' : 'pt',
    isBot: typeof website === 'string' && website.length > 0,
  };

  if (!data.name || !data.email || !data.message) return { success: false, error: 'missing_fields' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { success: false, error: 'invalid_email' };
  if (
    data.name.length > CONTACT_LIMITS.name
    || data.email.length > CONTACT_LIMITS.email
    || data.message.length > CONTACT_LIMITS.message
  ) return { success: false, error: 'too_long' };

  return { success: true, data };
}

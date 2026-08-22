// Mirrors the backend rule in IleSure_Backend/src/middleware/validationMiddleware.ts
// so the client rejects weak passwords before the request instead of surfacing a
// confusing server-side validation error.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a number';

export function isStrongPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

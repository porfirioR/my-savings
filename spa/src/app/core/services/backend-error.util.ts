/**
 * Known backend error codes (thrown as ConflictException/BadRequestException
 * messages) mapped to their TOAST.* translation key. Add an entry here
 * whenever the backend gains a new stable error code the UI should explain,
 * instead of falling back to a generic "something went wrong" message.
 */
const BACKEND_ERROR_TOASTS: Record<string, string> = {
  POSITION_ACTIVE_TAKEN: 'TOAST.MEMBER_POSITION_TAKEN',
  RUEDA_NUMBER_TAKEN: 'TOAST.RUEDA_NUMBER_TAKEN',
  SLOT_POSITION_TAKEN: 'TOAST.SLOT_POSITION_TAKEN',
  MEMBER_ALREADY_IN_RUEDA: 'TOAST.MEMBER_ALREADY_IN_RUEDA',
  PAYMENT_ALREADY_EXISTS: 'TOAST.PAYMENT_ALREADY_EXISTS',
  LOAN_PAYMENT_ALREADY_EXISTS: 'TOAST.LOAN_PAYMENT_ALREADY_EXISTS',
};

/** Resolves an HttpErrorResponse (or similar) to a translation key, falling back if unknown. */
export function backendErrorToastKey(err: unknown, fallbackKey: string): string {
  const code = (err as { error?: { message?: string } })?.error?.message;
  return (code && BACKEND_ERROR_TOASTS[code]) || fallbackKey;
}

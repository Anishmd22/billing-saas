import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

/** Extracts the first human-readable message from a Zod v4 error (uses .issues) */
export function zodErrorMessage(err: ZodError): string {
  return err.issues?.[0]?.message ?? 'Validation error';
}

/** Returns a standard 400 validation error response */
export function validationError(err: ZodError) {
  return NextResponse.json(
    { success: false, error: { code: 'ERR_VALIDATION', message: zodErrorMessage(err) } },
    { status: 400 }
  );
}

/** Returns a standard 500 server error response */
export function serverError(message = 'Internal server error') {
  return NextResponse.json(
    { success: false, error: { code: 'ERR_SERVER', message } },
    { status: 500 }
  );
}

/** Returns a standard 404 not found response */
export function notFound(code: string, message: string) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status: 404 }
  );
}

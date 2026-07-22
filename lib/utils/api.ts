import { NextResponse } from 'next/server';

export function ok<T>(data: T, meta?: object) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function serverError(error: unknown) {
  // requireAuth / requireAdmin throw a plain Response — pass it through
  if (error instanceof Response) return error;
  console.error('[API ERROR]', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

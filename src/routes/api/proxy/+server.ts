import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const target = url.searchParams.get('target');
  if (!target) {
    return new Response(JSON.stringify({ error: 'Missing target URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const res = await fetch(target);
  return new Response(res.body, { headers: res.headers });
};

import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const target = url.searchParams.get('target');
  if (!target) {
    return new Response(JSON.stringify({ error: 'Missing target URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const res = await fetch(target);
    return new Response(res.body, {
      status: res.status,
      headers: res.headers
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

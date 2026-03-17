export const GET = async ({ url }) => {
  const target = url.searchParams.get('target');
  const res = await fetch(target!);
  return new Response(res.body, { headers: res.headers });
};

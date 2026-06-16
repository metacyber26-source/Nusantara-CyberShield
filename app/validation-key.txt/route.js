export const dynamic = 'force-dynamic';

export async function GET() {
  const token = "82fe9726ef386c9d607e0c8cbd80d1d05622e00f90029f223a403a3f2743f721643c92ca7d0cae915abd1db924fa194c99e9a7539518831ef0c59eba432bb6d6";
  
  return new Response(token, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

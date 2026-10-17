// Standalone Jay AI prototype Worker. Never deploy over the production VRM Worker.
// Configure with wrangler: secret OPENAI_API_KEY, optional env MODEL and ALLOWED_ORIGIN.
// IMPORTANT: Auth/rate limits are required before any public deployment.
export default {
 async fetch(request, env) {
  const origin=request.headers.get('Origin') || '';
  const allow=env.ALLOWED_ORIGIN || 'https://juliotriana55-art.github.io';
  const cors={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin'};
  if(origin!==allow)return new Response('Origin not allowed',{status:403});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:cors});
  if(!env.OPENAI_API_KEY)return Response.json({error:'AI provider is not configured'}, {status:503,headers:cors});
  // Block use before proper authentication and rate limits are configured.
  if(!env.JAY_AUTH_READY)return Response.json({error:'Private pilot authentication not configured'}, {status:503,headers:cors});
  // No network call until verified server-side authentication is implemented.
  return Response.json({error:'Authentication integration pending; no provider request made'}, {status:501,headers:cors});
 }
};

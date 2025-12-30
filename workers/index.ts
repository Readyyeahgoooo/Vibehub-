// Cloudflare Worker for Vibe Hub API

export interface Env {
  KV: KVNamespace;
  R2_BUCKET: R2Bucket;
  OPENROUTER_API_KEY: string;
  ADMIN_TOKEN: string;
  ALLOWED_ORIGIN: string;
}

// CORS headers
function getCORSHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle CORS preflight
function handleOPTIONS(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN;
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(origin),
  });
}

// Add CORS headers to response
function addCORSHeaders(response: Response, origin: string): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(getCORSHeaders(origin)).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Main worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOPTIONS(request, env);
    }

    try {
      let response: Response;

      // Route requests
      switch (url.pathname) {
        case '/api/upload':
          response = await handleUpload(request, env);
          break;
        case '/api/verify':
          response = await handleVerify(request, env);
          break;
        case '/api/submit':
          response = await handleSubmit(request, env);
          break;
        case '/api/apps':
          response = await handleGetApps(request, env);
          break;
        case '/api/admin/pending':
          response = await handleAdminPending(request, env);
          break;
        case '/api/admin/approve':
          response = await handleAdminApprove(request, env);
          break;
        default:
          response = new Response(JSON.stringify({ error: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
      }

      return addCORSHeaders(response, origin);
    } catch (error) {
      console.error('Worker error:', error);
      const errorResponse = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An internal error occurred',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return addCORSHeaders(errorResponse, origin);
    }
  },
};

// Placeholder handlers (to be implemented)
async function handleUpload(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Upload endpoint - to be implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleVerify(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Verify endpoint - to be implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleSubmit(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Submit endpoint - to be implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleGetApps(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Get apps endpoint - to be implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleAdminPending(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Admin pending endpoint - to be implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleAdminApprove(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Admin approve endpoint - to be implemented' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

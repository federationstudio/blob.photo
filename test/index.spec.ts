import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

async function handleRequest(path: string) {
    const request = new IncomingRequest('https://example.com' + path);
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    return response;
}

describe('blobs.blue', () => {
    it('root redirects to github', async () => {
        const response = await handleRequest('/');
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(env.REPO_URL);
    });

    // TODO: Add more tests for each endpoint
});

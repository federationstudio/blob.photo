import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker from '../src/index';

const testActor: string = 'did:plc:67pv3ct6h7yi5dqfd2uuxft2';
const testImagePostId: string = '3lpupqthpp22u';
const testVideoPostId: string = '3lpupt4ybwc2u';
const testBlobCid: string = 'bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u';
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

async function handleRequest(path: string) {
    const request = new IncomingRequest('https://example.com' + path);
    const ctx = createExecutionContext();
    // await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    return response;
}

describe('blobs.blue', () => {
    it('/ : redirects to github', async () => {
        const response = await handleRequest('/');
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(env.REPO_URL);
    });

    it('/{actor} : redirects to avatar', async () => {
        const response = await handleRequest(`/${ testActor }`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/avatar/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/avatar : redirects to avatar', async () => {
        const response = await handleRequest(`/${ testActor }/avatar`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/avatar/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/avatar-thumb : redirects to small avatar', async () => {
        const response = await handleRequest(`/${ testActor }/avatar-thumb`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/banner : redirects to banner', async () => {
        const response = await handleRequest(`/${ testActor }/banner`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/banner/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreid3hcvf4fhvn3rxd73vddznakdyk2yllnwl5bqoeybp33vbe47siq@jpeg');
    });

    it('/{actor}/post-image/{postId} : redirects to first post image', async () => {
        const response = await handleRequest(`/${ testActor }/post-image/${ testImagePostId }`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/post-image/{postId}/[blobIndex] : redirects to post image [0]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image/${ testImagePostId }/0`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/post-image/{postId}/[blobIndex] : redirects to post image [1]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image/${ testImagePostId }/1`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreif7pmeplkadpcm46u7ne4xinsjgg5ea6vfwn3aeds5kb3z27wavym@jpeg');
    });

    it('/{actor}/post-image/{postId}/[blobIndex] : redirects to post image [2]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image/${ testImagePostId }/2`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreidrpjxqfbswrqfirzsongsydh7jmyaanx7fehfjxsk2rabfffhlwe@jpeg');
    });

    it('/{actor}/post-image/{postId}/[blobIndex] : redirects to post image [3]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image/${ testImagePostId }/3`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreiaplidbfqsvh73eosvdttubhy5o2ekctlygksmfv3ddcszdafz5tm@jpeg');
    });

    it('/{actor}/post-image-thumb/{postId} : redirects to first small post image', async () => {
        const response = await handleRequest(`/${ testActor }/post-image-thumb/${ testImagePostId }`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/post-image-thumb/{postId}/[blobIndex] : redirects to small post image [0]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image-thumb/${ testImagePostId }/0`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u@jpeg');
    });

    it('/{actor}/post-image-thumb/{postId}/[blobIndex] : redirects to small post image [1]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image-thumb/${ testImagePostId }/1`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreif7pmeplkadpcm46u7ne4xinsjgg5ea6vfwn3aeds5kb3z27wavym@jpeg');
    });

    it('/{actor}/post-image-thumb/{postId}/[blobIndex] : redirects to small post image [2]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image-thumb/${ testImagePostId }/2`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreidrpjxqfbswrqfirzsongsydh7jmyaanx7fehfjxsk2rabfffhlwe@jpeg');
    });

    it('/{actor}/post-image-thumb/{postId}/[blobIndex] : redirects to small post image [3]', async () => {
        const response = await handleRequest(`/${ testActor }/post-image-thumb/${ testImagePostId }/3`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreiaplidbfqsvh73eosvdttubhy5o2ekctlygksmfv3ddcszdafz5tm@jpeg');
    });

    it('/{actor}/post-video/{postId} : redirects to post video blob', async () => {
        const response = await handleRequest(`/${ testActor }/post-video/${ testVideoPostId }`);
        expect(response.status).toBe(302);
        // Blob CDNs redirect to different domains, we check the path instead
        expect(response.headers.get('Location')).toContain('/xrpc/com.atproto.sync.getBlob?did=did:plc:67pv3ct6h7yi5dqfd2uuxft2&cid=bafkreicrjif5q2hpvvx3jlab4bijiwmr5om6zsoh4mcng2dl7yv4scdxsm');
    });

    it('/{actor}/post-video/{postId}/thumb : redirects to post video thumbnail', async () => {
        const response = await handleRequest(`/${ testActor }/post-video/${ testVideoPostId }/thumb`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://video.bsky.app/watch/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreicrjif5q2hpvvx3jlab4bijiwmr5om6zsoh4mcng2dl7yv4scdxsm/thumbnail.jpg');
    });

    it('/{actor}/post-video/{postId}/playlist : redirects to post video playlist', async () => {
        const response = await handleRequest(`/${ testActor }/post-video/${ testVideoPostId }/playlist`);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://video.bsky.app/watch/did:plc:67pv3ct6h7yi5dqfd2uuxft2/bafkreicrjif5q2hpvvx3jlab4bijiwmr5om6zsoh4mcng2dl7yv4scdxsm/playlist.m3u8');
    });

    it('/{actor}/blob/{cid} : redirects to raw blob', async () => {
        const response = await handleRequest(`/${ testActor }/blob/${ testBlobCid }`);
        expect(response.status).toBe(302);
        // Blob CDNs redirect to different domains, we check the path instead
        expect(response.headers.get('Location')).contains('/xrpc/com.atproto.sync.getBlob?did=did:plc:67pv3ct6h7yi5dqfd2uuxft2&cid=bafkreifhaamh3y3juxgjowfor4kkzu6o37b3gqv5budpexxgjyjr5r222u');
    });
});

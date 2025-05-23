/**
 * B L O B S . B L U E
 * - - - - -
 * **Blue Blobs** is a lightweight Cloudflare Worker that proxies avatars,
 * banners, post media, videos, and blobs from Bluesky’s CDN.
 * No decoding, no API keys, no wasted bandwidth.
 *
 * @author Federation Studio
 *
 * @link https://federation.studio
 * @link https://github.com/federationstudio/blobs.blue
 *
 * @license MIT
 */
import { image } from './handlers/image';
import { video } from './handlers/video';
import { parseBaseSegments, parseBlobSegments, parseImageSegments, parseUrl, parseVideoSegments } from './helpers/url';
import { resolveHandleToDID } from './helpers/at-proto';
import { blob } from './handlers/blob';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        console.log('⚡ hostname:', url.hostname);
        console.log('⚡ path:', url.pathname);
        const { format, segments } = parseUrl(request.url);
        console.log('📦 segments:', segments);

        // Redirect root
        if (segments.length === 1 && !segments[0].trim()) {
            console.log('✅ matched root');
            return Response.redirect(env.REPO_URL, 302);
        }

        const { actor, section } = parseBaseSegments(segments);
        const did = await resolveHandleToDID(env, actor);
        if ( !did) return new Response(`Unable to resolve DID from ${ actor }`, { status: 404 });

        // Utility
        const fullSize = !section?.endsWith('-thumb');

        switch (section) {
            case undefined:

                if (segments.length === 1) {
                    image.init(request, env, ctx);
                    return image.fetchAvatar(did, true, format);
                }
                break;

            case 'avatar':
            case 'avatar-thumb':
                if (segments.length === 2) {
                    image.init(request, env, ctx);
                    return image.fetchAvatar(did, fullSize, format);
                }
                break;

            case 'banner':
                if (segments.length === 2) {
                    image.init(request, env, ctx);
                    return image.fetchBanner(did, format);
                }
                break;

            case 'post-image':
            case 'post-image-thumb':
                image.init(request, env, ctx);
                const { imagePostId, blobIndex } = parseImageSegments(segments);

                if (segments.length === 3) {
                    return image.fetchPostMedia(did, imagePostId, 0, fullSize, format);
                }

                if (segments.length === 4) {
                    return image.fetchPostMedia(did, imagePostId, blobIndex || 0, fullSize, format);
                }
                break;

            case 'post-video':
                video.init(request, env, ctx);
                const { videoPostId, typeExpected } = parseVideoSegments(segments);

                if (segments.length === 3) {
                    return video.fetchPostMedia(did, videoPostId);
                }

                if (segments.length === 4) {
                    if (typeExpected === 'thumb') {
                        return video.fetchThumbnail(did, videoPostId);
                    }
                    if (typeExpected === 'playlist') {
                        return video.fetchPlaylist(did, videoPostId);
                    }
                }
                break;

            case 'blob':
                if (segments.length === 3) {
                    blob.init(request, env, ctx);
                    const { Cid } = parseBlobSegments(segments);
                    return blob.fetchBlob(did, Cid);
                }
                break;
        }

        return new Response('Not Found', { status: 404 });
    }
} satisfies ExportedHandler<Env>;

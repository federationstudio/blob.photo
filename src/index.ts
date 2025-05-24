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
import {
    parseBaseSegments,
    parseBlobSegments,
    parseLinkSegments,
    parseImageSegments,
    parseUrl,
    parseVideoSegments
} from './helpers/url';
import { resolveHandleToDID } from './helpers/at-proto';
import { blob } from './handlers/blob';
import { link } from './handlers/link';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const { format, segments } = parseUrl(request.url);

        // Redirect root
        if (segments.length === 1 && !segments[0].trim()) {
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
                    return image.fetchPostImage(did, imagePostId, 0, fullSize, format);
                }

                if (segments.length === 4) {
                    return image.fetchPostImage(did, imagePostId, blobIndex || 0, fullSize, format);
                }
                break;

            case 'post-video':
                video.init(request, env, ctx);
                const { videoPostId, typeExpected } = parseVideoSegments(segments);

                if (segments.length === 3) {
                    return video.fetchPostVideo(did, videoPostId);
                }

                if (segments.length === 4) {
                    if (typeExpected === 'thumb') {
                        return video.fetchPostThumbnail(did, videoPostId);
                    }
                    if (typeExpected === 'playlist') {
                        return video.fetchPostPlaylist(did, videoPostId);
                    }
                }
                break;

            case 'post-link':
            case 'post-link-thumb':
                link.init(request, env, ctx);
                const { externalPostId } = parseLinkSegments(segments);

                if (segments.length === 3) {
                    return link.fetchPostLink(did, externalPostId, fullSize);
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

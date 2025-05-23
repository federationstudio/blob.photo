/**
 * B L O B . D I R E C T — by @federation.studio
 * ------------------------------------------
 * Blob.direct is a minimal Bluesky image proxy that redirects avatar, banner,
 * and post media requests to Bluesky’s CDN.
 *
 * Supported routes:
 * - Avatar: /{actor}
 * - Banner: /{actor}/banner
 * - Post:   /{actor}/post/{postId} (defaults to first image)
 *           /{actor}/post/{postId}/{blobIndex}
 * - Blob:   /{actor}/blob/{cid}
 *
 * Supports optional format suffixes: @jpeg, @png, @webp
 */
import { image } from './handlers/image';
import { video } from './handlers/video';

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url);
        const mediaType = url.hostname.startsWith('image') ? 'image' : 'video';

        switch (mediaType) {
            case 'image':
                return image.handle(request, env, ctx);
            case 'video':
                return video.handle(request, env, ctx);
            default:
                return Response.redirect('https://github.com/federationstudio/blob.direct', 302);
        }
    }
} satisfies ExportedHandler<Env>;

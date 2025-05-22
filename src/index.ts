/**
 * B L O B . P H O T O — by @federation.studio
 * ------------------------------------------
 * A minimal Bluesky image proxy that redirects avatar, banner, and post media
 * requests to Bluesky’s CDN.
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

const BSKY_PUBLIC_API = 'https://public.api.bsky.app/xrpc';
const CACHE_TTL_QUARTER_DAY = 21600;
const CACHE_TTL_DAY = 86400;

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url);

        const rawPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        const formatMatch = rawPath.match(/@(\w+)$/);
        const format = formatMatch ? formatMatch[1].toLowerCase() : 'jpeg';
        const path = formatMatch ? rawPath.replace(/@(\w+)$/, '') : rawPath;
        const segments = path.split('/');

        // Redirect root to GitHub
        if (segments.length === 1 && segments[0].trim() === '') {
            return Response.redirect('https://github.com/federationstudio/blob.photo', 302);
        }

        // Route handling
        const [actor, section, contextualId, blobIndexStr] = segments;
        const formattedActor = actor.replace(/@/, '').replace(/:sm$/, '');
        const did = await resolveHandleToDID(env, formattedActor);

        if ( !did) {
            return new Response('Unable to resolve DID from ' + formattedActor, { status: 404 });
        }

        // `{actor}` or `/{actor}:sm`
        if (segments.length === 1) {
            const fullSize = !actor.endsWith(':sm');
            return fetchAvatar(env, did, fullSize, format);
        }

        // `/{actor}/avatar` or `/{actor}/avatar:sm`
        if (segments.length === 2 && section.startsWith('avatar')) {
            const fullSize = !section.endsWith(':sm');
            return fetchAvatar(env, did, fullSize, format);
        }

        // `/{actor}/banner`
        if (segments.length === 2 && section === 'banner') {
            return fetchBanner(env, did, format);
        }

        // `/{actor}/blob/{cid}`
        if (segments.length === 3 && section === 'blob') {
            return fetchBlob(env, did, contextualId);
        }

        // `/{actor}/post/{postId}` or `/{actor}/post:sm/{postId}`
        if (segments.length === 3 && section.startsWith('post')) {
            const fullSize = !section.endsWith(':sm');
            return fetchPostMedia(env, did, contextualId, 0, fullSize, format);
        }

        // `/{actor}/post/{postId}/{blobIndex}` or `/{actor}/post:sm/{postId}/{blobIndex}`
        if (segments.length === 4 && section.startsWith('post')) {
            const fullSize = !section.endsWith(':sm');
            const blobIndex = parseInt(blobIndexStr, 10);
            return fetchPostMedia(env, did, contextualId, blobIndex, fullSize, format);
        }

        return new Response('Not Found', { status: 404 });
    }
} satisfies ExportedHandler<Env>;


/* Helper Functions
 * - - - - - - - - - - - - - */

async function resolveHandleToDID(env: Env, actor: string): Promise<string | null> {
    if (actor.startsWith('did:plc:')) return actor;

    const cached = await env.blob_photo.get(`did:${ actor }`);
    if (cached) return cached;

    try {
        const res = await fetch(`${ BSKY_PUBLIC_API }/com.atproto.identity.resolveHandle?handle=${ actor }`);
        if ( !res.ok) return null;
        const data = await res.json() as { did: string };
        await env.blob_photo.put(`did:${ actor }`, data.did, { expirationTtl: CACHE_TTL_DAY });
        return data.did;
    } catch {
        return null;
    }
}

async function getPublicProfile(env: Env, did: string) {
    try {
        const res = await fetch(`${ BSKY_PUBLIC_API }/app.bsky.actor.getProfile?actor=${ did }`);
        if ( !res.ok) return null;
        return await res.json() as {
            did: string;
            avatar: string | null;
            banner: string | null;
        };
    } catch {
        return null;
    }
}


/* Fetch Functions
 * - - - - - - - - - - - - - */

async function fetchAvatar(env: Env, did: string, fullSize: boolean, format: string): Promise<Response> {
    const cached = await env.blob_photo.get(`avatar:${ did }`);
    if (cached) {
        let url = cached.replace(/@[^/]+$/, `@${ format }`);
        url = fullSize
            ? url.replace(/\/avatar_thumbnail\//, '/avatar/')
            : url.replace(/\/avatar\//, '/avatar_thumbnail/');
        return Response.redirect(url, 302);
    }

    const profile = await getPublicProfile(env, did);
    if ( !profile || !profile.avatar) {
        return new Response('Avatar not found for ' + did, { status: 404 });
    }

    let url = profile.avatar.replace(/@[^/]+$/, `@${ format }`);
    url = fullSize ? url : url.replace(/\/avatar\//, '/avatar_thumbnail/');
    await env.blob_photo.put(`avatar:${ did }`, url, { expirationTtl: CACHE_TTL_QUARTER_DAY });
    return Response.redirect(url, 302);
}

async function fetchBanner(env: Env, did: string, format: string): Promise<Response> {
    const cached = await env.blob_photo.get(`banner:${ did }`);
    if (cached) {
        const url = cached.replace(/@[^/]+$/, `@${ format }`);
        return Response.redirect(url, 302);
    }

    const profile = await getPublicProfile(env, did);
    if ( !profile || !profile.banner) {
        return new Response('Banner not found for ' + did, { status: 404 });
    }

    const url = profile.banner.replace(/@[^/]+$/, `@${ format }`);
    await env.blob_photo.put(`banner:${ did }`, url, { expirationTtl: CACHE_TTL_QUARTER_DAY });
    return Response.redirect(url, 302);
}

async function fetchPostMedia(
    env: Env,
    did: string,
    postId: string,
    blobIndex: number,
    fullSize: boolean,
    format: string
): Promise<Response> {
    const cached = await env.blob_photo.get(`post:${ did }:${ postId }:${ blobIndex }`);
    if (cached) {
        let url = cached.replace(/@[^/]+$/, `@${ format }`);
        url = fullSize
            ? url.replace(/\/feed_thumbnail\//, '/feed_fullsize/')
            : url.replace(/\/feed_fullsize\//, '/feed_thumbnail/');
        return Response.redirect(url, 302);
    }

    const postUri = `at://${ did }/app.bsky.feed.post/${ postId }`;
    const res = await fetch(`${ BSKY_PUBLIC_API }/app.bsky.feed.getPostThread?uri=${ postUri }`);
    if ( !res.ok) return new Response('Post ' + postId + ' not found for ' + did, { status: 404 });

    const data = await res.json() as {
        thread?: {
            post?: any;
        };
    };
    const post = data.thread?.post;
    const embed = post?.record?.embed;

    if (
        !embed ||
        embed.$type !== 'app.bsky.embed.images' ||
        !Array.isArray(embed.images) ||
        !embed.images[blobIndex]
    ) {
        return new Response('Image not found', { status: 404 });
    }

    const cid = embed.images[blobIndex].image.ref['$link'];
    const size = fullSize ? 'feed_fullsize' : 'feed_thumbnail';
    const url = `https://cdn.bsky.app/img/${ size }/plain/${ did }/${ cid }@${ format }`;
    await env.blob_photo.put(`post:${ did }:${ postId }:${ blobIndex }`, url, { expirationTtl: CACHE_TTL_DAY });
    return Response.redirect(url, 302);
}

async function fetchBlob(
    env: Env,
    did: string,
    cid: string
): Promise<Response> {
    const cached = await env.blob_photo.get(`blob:${ did }:${ cid }`);
    if (cached) return Response.redirect(cached, 302);

    const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${ did }&cid=${ cid }`;
    await env.blob_photo.put(`blob:${ did }:${ cid }`, url, { expirationTtl: CACHE_TTL_DAY });
    return Response.redirect(url, 302);
}

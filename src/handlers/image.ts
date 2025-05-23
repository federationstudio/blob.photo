import { getPublicProfile, resolveHandleToDID } from '../helpers/at-proto';
import { BSKY_PUBLIC_API, CACHE_TTL_DAY, CACHE_TTL_QUARTER_DAY } from '../lib/constants';
import { pathSegmentParser, urlParser } from '../helpers/url';

export const image = {
    request: null as Request | null,
    env: null as Env | null,
    ctx: null as ExecutionContext | null,

    init(request: Request, env: Env, ctx: ExecutionContext) {
        this.request = request;
        this.env = env;
        this.ctx = ctx;
    },

    async handle(
        request: Request,
        env: Env,
        ctx: ExecutionContext,
    ): Promise<Response> {
        this.init(request, env, ctx);

        const {
            format,
            segments
        } = urlParser(request.url);

        // Redirect root to GitHub
        if (segments.length === 1 && segments[0].trim() === '') {
            return Response.redirect('https://github.com/federationstudio/blob.photo', 302);
        }

        // Route handling
        const {
            actor,
            section,
            contextualId,
            blobIndex,
            formattedActor
        } = pathSegmentParser(segments);
        const did = await resolveHandleToDID(env, formattedActor);

        if ( !did) {
            return new Response('Unable to resolve DID from ' + formattedActor, { status: 404 });
        }

        if (segments.length === 1) {
            const fullSize = !actor.endsWith(':sm');
            return this.fetchAvatar(did, fullSize, format);
        }

        if (segments.length === 2 && section.startsWith('avatar')) {
            const fullSize = !section.endsWith(':sm');
            return this.fetchAvatar(did, fullSize, format);
        }

        if (segments.length === 2 && section === 'banner') {
            return this.fetchBanner(did, format);
        }

        if (segments.length === 3 && section === 'blob') {
            return this.fetchBlob(did, contextualId);
        }

        if (segments.length === 3 && section.startsWith('post')) {
            const fullSize = !section.endsWith(':sm');
            return this.fetchPostMedia(did, contextualId, 0, fullSize, format);
        }

        if (segments.length === 4 && section.startsWith('post')) {
            const fullSize = !section.endsWith(':sm');
            return this.fetchPostMedia(did, contextualId, blobIndex || 0, fullSize, format);
        }

        return new Response('Not Found', { status: 404 });
    },


    /* Fetch Functions
     * - - - - - - - - - - - - - */

    async fetchAvatar(did: string, fullSize: boolean, format: string): Promise<Response> {
        const cached = await this.env!.blob_photo.get(`avatar:${ did }`);

        if (cached) {
            let url = cached.replace(/@[^/]+$/, `@${ format }`);
            url = fullSize
                ? url.replace(/\/avatar_thumbnail\//, '/avatar/')
                : url.replace(/\/avatar\//, '/avatar_thumbnail/');
            return Response.redirect(url, 302);
        }

        const profile = await getPublicProfile(did);

        if ( !profile || !profile.avatar) {
            return new Response('Avatar not found for ' + did, { status: 404 });
        }

        const url = profile.avatar
            .replace(/@[^/]+$/, `@${format}`)
            .replace(/\/avatar\//, fullSize ? '/avatar/' : '/avatar_thumbnail/');
        await this.env!.blob_photo.put(`avatar:${ did }`, url, { expirationTtl: CACHE_TTL_QUARTER_DAY });

        return Response.redirect(url, 302);
    },

    async fetchBanner(did: string, format: string): Promise<Response> {
        const cached = await this.env!.blob_photo.get(`banner:${ did }`);

        if (cached) {
            const url = cached.replace(/@[^/]+$/, `@${ format }`);
            return Response.redirect(url, 302);
        }

        const profile = await getPublicProfile(did);

        if ( !profile || !profile.banner) {
            return new Response('Banner not found for ' + did, { status: 404 });
        }

        const url = profile.banner.replace(/@[^/]+$/, `@${ format }`);
        await this.env!.blob_photo.put(`banner:${ did }`, url, { expirationTtl: CACHE_TTL_QUARTER_DAY });

        return Response.redirect(url, 302);
    },

    async fetchPostMedia(
        did: string,
        postId: string,
        blobIndex: number,
        fullSize: boolean,
        format: string
    ): Promise<Response> {
        const cached = await this.env!.blob_photo.get(`post:${ did }:${ postId }:${ blobIndex }`);
        if (cached) {
            const url = cached
                .replace(/@[^/]+$/, `@${format}`)
                .replace(
                    fullSize ? /\/feed_thumbnail\// : /\/feed_fullsize\//,
                    fullSize ? '/feed_fullsize/' : '/feed_thumbnail/'
                );
            return Response.redirect(url, 302);
        }

        const postUri = `at://${ did }/app.bsky.feed.post/${ postId }`;
        const res = await fetch(`${ BSKY_PUBLIC_API }/app.bsky.feed.getPostThread?uri=${ postUri }`);
        if ( !res.ok) return new Response('Post ' + postId + ' not found for ' + did, { status: 404 });

        const data = await res.json() as any;
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
        await this.env!.blob_photo.put(`post:${ did }:${ postId }:${ blobIndex }`, url, { expirationTtl: CACHE_TTL_DAY });
        return Response.redirect(url, 302);
    },

    async fetchBlob(
        did: string,
        cid: string
    ): Promise<Response> {
        const cached = await this.env!.blob_photo.get(`blob:${ did }:${ cid }`);
        if (cached) return Response.redirect(cached, 302);

        const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${ did }&cid=${ cid }`;
        await this.env!.blob_photo.put(`blob:${ did }:${ cid }`, url, { expirationTtl: CACHE_TTL_DAY });
        return Response.redirect(url, 302);
    }
}

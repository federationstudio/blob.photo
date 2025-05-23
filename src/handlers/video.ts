import { pathSegmentParser, urlParser } from '../helpers/url';
import { resolveHandleToDID } from '../helpers/at-proto';
import { BSKY_PUBLIC_API, CACHE_TTL_DAY } from '../lib/constants';

export const video = {
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

        const { segments } = urlParser(request.url);

        // Redirect root to GitHub
        if (segments.length === 1 && segments[0].trim() === '') {
            return Response.redirect('https://github.com/federationstudio/blob.photo', 302);
        }

        // Route handling
        const {
            section,
            contextualId,
            formattedActor
        } = pathSegmentParser(segments);

        const did = await resolveHandleToDID(env, formattedActor);

        if ( !did) {
            return new Response('Unable to resolve DID from ' + formattedActor, { status: 404 });
        }

        if (segments.length === 3 && section === 'blob') {
            return this.fetchBlob(did, contextualId);
        }

        if (segments.length === 3 && section === 'post') {
            return this.fetchPostMedia(did, contextualId);
        }

        if (segments.length === 4 && section === 'post' && contextualId === 'poster') {
            return this.fetchPostMedia(did, contextualId);
        }

        if (segments.length === 4 && section === 'post' && contextualId === 'playlist') {
            return this.fetchPostMedia(did, contextualId);
        }

        return new Response('Not Found', { status: 404 });
    },

    async fetchPostMedia(
        did: string,
        postId: string,
    ): Promise<Response> {
        const cached = await this.env!.blob_photo.get(`post:${ did }:${ postId }`);
        if (cached) return Response.redirect(cached, 302);

        const postUri = `at://${ did }/app.bsky.feed.post/${ postId }`;
        const res = await fetch(`${ BSKY_PUBLIC_API }/app.bsky.feed.getPostThread?uri=${ postUri }`);
        if ( !res.ok) return new Response('Post ' + postId + ' not found for ' + did, { status: 404 });

        const data = await res.json() as any;
        const post = data.thread?.post;
        const embed = post?.record?.embed;

        if ( !embed || embed.$type !== 'app.bsky.embed.video') {
            return new Response('Video not found', { status: 404 });
        }

        const cid = embed.video.ref['$link'];
        const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${ did }&cid=${ cid }`;
        await this.env!.blob_photo.put(`post:${ did }:${ postId }`, url, { expirationTtl: CACHE_TTL_DAY });
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

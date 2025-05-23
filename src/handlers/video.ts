import { getPublicPost } from '../helpers/at-proto';

export const video = {
    request: null as Request | null,
    env: null as Env | null,
    ctx: null as ExecutionContext | null,

    init(request: Request, env: Env, ctx: ExecutionContext) {
        this.request = request;
        this.env = env;
        this.ctx = ctx;
    },

    /* Fetch Functions
     * - - - - - - - - - - - - - */

    async fetchPostMedia(
        did: string,
        postId: string
    ): Promise<Response> {
        const cached = await this.env!.blobs_blue.get(`post:${ did }:${ postId }`);
        if (cached) return Response.redirect(cached, 302);

        const data = await getPublicPost(this.env!, did, postId);

        if ( !data) return new Response('Post ' + postId + ' not found for ' + did, { status: 404 });

        const post = data.thread?.post;
        const embed = post?.embed;

        if ( !embed || embed.$type !== 'app.bsky.embed.video' || !embed.cid) {
            return new Response('Video not found', { status: 404 });
        }

        const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${ did }&cid=${ embed.cid }`;
        await this.env!.blobs_blue.put(`post_video:${ did }:${ postId }`, url, { expirationTtl: this.env!.CACHE_TTL_DAY });

        return Response.redirect(url, 302);
    },

    async fetchPlaylist(
        did: string,
        postId: string
    ): Promise<Response> {
        const cached = await this.env!.blobs_blue.get(`playlist:${ did }:${ postId }`);
        if (cached) return Response.redirect(cached, 302);

        const data = await getPublicPost(this.env!, did, postId);

        if ( !data) return new Response('Video ' + postId + ' not found for ' + did, { status: 404 });

        const post = data.thread?.post;
        const embed = post?.embed;

        if ( !embed || embed.$type !== 'app.bsky.embed.video#view' || !embed.playlist) {
            return new Response('Video not found', { status: 404 });
        }

        await this.env!.blobs_blue.put(`playlist:${ did }:${ postId }`, embed.playlist, { expirationTtl: this.env!.CACHE_TTL_DAY });

        return Response.redirect(embed.playlist, 302);
    },

    async fetchThumbnail(
        did: string,
        postId: string
    ): Promise<Response> {
        const cached = await this.env!.blobs_blue.get(`video_thumbnail:${ did }:${ postId }`);
        if (cached) return Response.redirect(cached, 302);

        const data = await getPublicPost(this.env!, did, postId);

        if ( !data) return new Response('Video ' + postId + ' not found for ' + did, { status: 404 });

        const post = data.thread?.post;
        const embed = post?.embed;

        if ( !embed || embed.$type !== 'app.bsky.embed.video#view' || !embed.thumbnail) {
            return new Response('Video not found', { status: 404 });
        }

        await this.env!.blobs_blue.put(`video_thumbnail:${ did }:${ postId }`, embed.thumbnail, { expirationTtl: this.env!.CACHE_TTL_DAY });

        return Response.redirect(embed.thumbnail, 302);
    }
};

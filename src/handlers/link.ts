import { getPublicPost } from '../helpers/at-proto';

export const link = {
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

    async fetchPostLink(
        did: string,
        postId: string,
        fullSize: boolean
    ): Promise<Response> {
        const cacheKeyType = fullSize ? 'link' : 'link_thumbnail';
        const cached = await this.env!.blobs_blue.get(`${ cacheKeyType }:${ did }:${ postId }`);
        if (cached) return Response.redirect(cached, 302);

        const data = await getPublicPost(this.env!, did, postId);
        if ( !data) return new Response('Post ' + postId + ' not found for ' + did, { status: 404 });

        const post = data.thread?.post;
        const embed = post?.embed;
        if (
            !embed ||
            embed.$type !== 'app.bsky.embed.external#view' ||
            !embed.external ||
            !embed.external.thumb
        ) {
            return new Response('Image not found', { status: 404 });
        }

        const url = embed.external.thumb.replace(/\/feed_thumbnail\//, fullSize ? '/feed_fullsize/' : '/feed_thumbnail/')
        await this.env!.blobs_blue.put(`${ cacheKeyType }:${ did }:${ postId }`, url, { expirationTtl: this.env!.CACHE_TTL_DAY });

        return Response.redirect(url, 302);
    }
};

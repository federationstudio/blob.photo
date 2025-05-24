import { getPublicPost, getPublicProfile } from '../helpers/at-proto';

export const image = {
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

    async fetchAvatar(did: string, fullSize: boolean, format: string): Promise<Response> {
        const cacheKeyType = fullSize ? 'avatar' : 'avatar_thumbnail';
        const cached = await this.env!.blobs_blue.get(`${ cacheKeyType }:${ did }`);
        if (cached) {
            let url = cached.replace(/@[^/]+$/, `@${ format }`);
            return Response.redirect(url, 302);
        }

        const profile = await getPublicProfile(this.env!, did);
        if ( !profile || !profile.avatar) {
            return new Response('Avatar not found for ' + did, { status: 404 });
        }

        const url = profile.avatar
        .replace(/@[^/]+$/, `@${ format }`)
        .replace(/\/avatar\//, fullSize ? '/avatar/' : '/avatar_thumbnail/');
        await this.env!.blobs_blue.put(`${ cacheKeyType }:${ did }`, url, { expirationTtl: this.env!.CACHE_TTL_QUARTER_DAY });

        return Response.redirect(url, 302);
    },

    async fetchBanner(did: string, format: string): Promise<Response> {
        const cached = await this.env!.blobs_blue.get(`banner:${ did }`);
        if (cached) {
            const url = cached.replace(/@[^/]+$/, `@${ format }`);
            return Response.redirect(url, 302);
        }

        const profile = await getPublicProfile(this.env!, did);
        if ( !profile || !profile.banner) {
            return new Response('Banner not found for ' + did, { status: 404 });
        }

        const url = profile.banner.replace(/@[^/]+$/, `@${ format }`);
        await this.env!.blobs_blue.put(`banner:${ did }`, url, { expirationTtl: this.env!.CACHE_TTL_QUARTER_DAY });

        return Response.redirect(url, 302);
    },

    async fetchPostImage(
        did: string,
        postId: string,
        blobIndex: number,
        fullSize: boolean,
        format: string
    ): Promise<Response> {
        const cacheKeyType = fullSize ? 'post_image' : 'post_image_thumbnail';
        const cached = await this.env!.blobs_blue.get(`${ cacheKeyType }:${ did }:${ postId }:${ blobIndex }`);
        if (cached) return Response.redirect(cached, 302);

        const data = await getPublicPost(this.env!, did, postId);
        if ( !data) return new Response('Post ' + postId + ' not found for ' + did, { status: 404 });

        const post = data.thread?.post;
        const embed = post?.embed;
        if (
            !embed ||
            embed.$type !== 'app.bsky.embed.images#view' ||
            !Array.isArray(embed.images) ||
            !embed.images[blobIndex]
        ) {
            return new Response('Image not found', { status: 404 });
        }

        const url = fullSize
            ? embed.images[blobIndex].fullsize
            : embed.images[blobIndex].thumb;
        await this.env!.blobs_blue.put(`${ cacheKeyType }:${ did }:${ postId }:${ blobIndex }`, url, { expirationTtl: this.env!.CACHE_TTL_DAY });

        return Response.redirect(url, 302);
    }
};

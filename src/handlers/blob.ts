export const blob = {
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

    async fetchBlob(
        did: string,
        cid: string
    ): Promise<Response> {
        const cached = await this.env!.blobs_blue.get(`blob:${ did }:${ cid }`);
        if (cached) return Response.redirect(cached, 302);

        const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${ did }&cid=${ cid }`;
        const res = await fetch(url);
        if ( !res.ok || !res.redirected) {
            return new Response('Blob not found for ' + did, { status: 404 });
        }

        const blobUrl = res.url;
        if ( !blobUrl) {
            return new Response('Blob URL not found for ' + did, { status: 404 });
        }

        await this.env!.blobs_blue.put(`blob:${ did }:${ cid }`, blobUrl, { expirationTtl: this.env!.CACHE_TTL_DAY });
        return Response.redirect(url, 302);
    }
};

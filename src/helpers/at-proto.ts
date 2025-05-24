export async function resolveHandleToDID(env: Env, actor: string): Promise<string | null> {
    if (actor.startsWith('did:plc:')) return actor;

    const cached = await env.blobs_blue.get(`did:${ actor }`);
    if (cached) return cached;

    try {
        const res = await fetch(`${ env.BSKY_PUBLIC_API }/com.atproto.identity.resolveHandle?handle=${ actor }`);
        if ( !res.ok) return null;
        const data = await res.json() as { did: string };
        await env.blobs_blue.put(`did:${ actor }`, data.did, { expirationTtl: env.CACHE_TTL_DAY });
        return data.did;
    } catch {
        return null;
    }
}

export async function getPublicProfile(env: Env, did: string) {
    try {
        const res = await fetch(`${ env.BSKY_PUBLIC_API }/app.bsky.actor.getProfile?actor=${ did }`);
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

export async function getPublicPost(env: Env, did: string, postId: string) {
    try {
        const postUri = `at://${ did }/app.bsky.feed.post/${ postId }`;
        const res = await fetch(`${ env.BSKY_PUBLIC_API }/app.bsky.feed.getPostThread?uri=${ postUri }&depth=0`);
        if ( !res.ok) return null;
        return await res.json() as {
            thread?: {
                post: {
                    uri: string;
                    cid: string;
                    embed: {
                        $type: string;
                        cid?: string;
                        playlist?: string;
                        thumbnail?: string;
                        images?: {
                            thumb: string,
                            fullsize: string,
                        }[];
                        external?: {
                            uri: string;
                            title?: string;
                            description?: string;
                            thumb?: string;
                        }
                    };
                };
            }
        };
    } catch {
        return null;
    }
}

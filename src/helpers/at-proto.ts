import { BSKY_PUBLIC_API, CACHE_TTL_DAY } from '../lib/constants';

export async function resolveHandleToDID(env: Env, actor: string): Promise<string | null> {
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

export async function getPublicProfile(did: string) {
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

export function parseUrl(urlString: string) {
    const url = new URL(urlString);
    const rawPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');

    const [pathWithoutFormat, format = 'jpeg'] = rawPath.split('@');
    const path = pathWithoutFormat;
    const segments = path.split('/');

    return {
        url,
        format: format.toLowerCase(),
        path,
        segments,
    };
}

export function parseBaseSegments([actor, section]: string[]) {
    return {
        actor: actor.replace(/^@/, ''),
        section,
    };
}

export function parseBlobSegments([, , Cid,]: string[]) {
    return {
        Cid
    };
}

export function parseImageSegments([, , imagePostId, blobIndexStr]: string[]) {
    return {
        imagePostId,
        blobIndex: blobIndexStr ? parseInt(blobIndexStr, 10) : undefined,
    };
}

export function parseVideoSegments([, , videoPostId, typeExpected]: string[]) {
    return {
        videoPostId,
        typeExpected
    };
}

export function parseLinkSegments([, , externalPostId, ]: string[]) {
    return {
        externalPostId
    };
}

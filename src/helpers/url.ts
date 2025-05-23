export function urlParser(urlString: string) {
    const url = new URL(urlString);
    const rawPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const formatMatch = rawPath.match(/@(\w+)$/);
    const format = formatMatch ? formatMatch[1].toLowerCase() : 'jpeg';
    const path = formatMatch ? rawPath.replace(/@(\w+)$/, '') : rawPath;
    const segments = path.split('/');

    return {
        url,
        format,
        path,
        segments
    };
}

export function pathSegmentParser(segments: string[]) {
    const [actor, section, contextualId, blobIndexStr] = segments;
    const formattedActor = actor.replace(/@/, '').replace(/:sm$/, '');
    const blobIndex = blobIndexStr ? parseInt(blobIndexStr, 10) : undefined;

    return {
        actor,
        section,
        contextualId,
        blobIndex,
        formattedActor
    };
}

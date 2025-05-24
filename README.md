# Blue Blobs

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy_to_Cloudflare-%23F38020?style=flat&logo=cloudflare&logoColor=ffffff)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Ffederationstudio%2Fblobs.blue)

**Blue Blobs** ([blobs.blue](https://blobs.blue)) is a lightweight Cloudflare Worker that proxies **avatars, banners,
post images, and blobs** from Bluesky’s CDN—no decoding, no API keys, no wasted bandwidth.

Built by [@federation.studio](https://bsky.app/profile/federation.studio)

## Table of Contents

<!-- TOC -->

* [Blue Blobs](#blue-blobs)
    * [Table of Contents](#table-of-contents)
* [Usage](#usage)
    * [Parameters](#parameters)
    * [Avatar](#avatar)
    * [Banners](#banners)
    * [Post Media](#post-media)
        * [Post Images](#post-images)
        * [Post Video](#post-video)
        * [Link Previews](#link-previews)
    * [Blobs](#blobs)
    * [Formats](#formats)

<!-- TOC -->

# Usage

There are three types of images that can be proxied:

1. **Avatar**: The profile picture of a user.
2. **Banners**: The header image of a user profile.
3. **Post Media**:
    1. **Images**: Images from a post.
    2. **Videos**: Videos from a post.
    3. **Link Previews**: Link preview image of a post.
4. **Blobs**: Individual blobs uploaded to PDS.

## Parameters

Here is a quick reference for the parameters used in the URLs:

**Required:**

- `{actor}`: The handle or DID of the user.
- `{postId}`: The ID of the post.
- `{cid}`: The CID of the blob.

**Optional:**

- `[blobIndex]`: The index of the blob in the post media array (optional).

## Avatar

To get the avatar of a user, use the URL format below. This will return the profile picture of the user. Fetching the
full-size image is the default behavior. If you want a thumbnail, you should use `/avatar-thumb` instead.

* **Full size**:
    * `https://blobs.blue/{actor}`
    * `https://blobs.blue/{actor}/avatar`
* **Thumbnail**:
    * `https://blobs.blue/{actor}/avatar-thumb`
* **Examples**:
    * `https://blobs.blue/bsky.app`
    * `https://blobs.blue/blob.is.helpful.fyi/avatar`
    * `https://blobs.blue/did:plc:z72i7hdynmk6r22z27h6tvur/avatar-thumb`

[<img src="https://blobs.blue/bsky.app" width="96">](https://blobs.blue/bsky.app)
[<img src="https://blobs.blue/blob.is.helpful.fyi/avatar" width="96">](https://blobs.blue/blob.is.helpful.fyi/avatar)
[<img src="https://blobs.blue/federation.studio/avatar-thumb" width="48">](https://blobs.blue/federation.studio/avatar-thumb)
[<img src="https://blobs.blue/vercel.com/avatar-thumb" width="48">](https://blobs.blue/vercel.com/avatar-thumb)

## Banners

To get the banner of a user, use the URL format below. This will return the header image of the user's profile.
Unfortunately,
the thumbnail version is not supported for banners. (Blame Bluesky for that.)

* **Full size**:
    * `https://blobs.blue/{actor}/banner`
* **Examples**:
    * `https://blobs.blue/bsky.app/banner`
    * `https://blobs.blue/did:plc:z72i7hdynmk6r22z27h6tvur/banner`

[<img src="https://blobs.blue/bsky.app/banner" height="96">](https://blobs.blue/bsky.app/banner) <br>
[<img src="https://blobs.blue/blob.is.helpful.fyi/banner" height="96">](https://blobs.blue/blob.is.helpful.fyi/banner)

## Post Media

There are multiple endpoints to get post media.

### Post Images

When it comes to post images (images embed), you can fetch the first image of a post or a specific image by its index.
If you want to fetch the thumbnail, you can use the `/post-image-thumb` endpoint.

* **Full size**:
    * `https://blobs.blue/{actor}/post-image/{postId}`
    * `https://blobs.blue/{actor}/post-image/{postId}/[blobIndex]`
* **Thumbnail**:
    * `https://blobs.blue/{actor}/post-image-thumb/{postId}`
    * `https://blobs.blue/{actor}/post-image-thumb/{postId}/[blobIndex]`
* **Examples**:
    * `https://blobs.blue/blob.is.helpful.fyi/post-image/3lpupqthpp22u`
    * `https://blobs.blue/blob.is.helpful.fyi/post-image/3lpupqthpp22u/1`
    * `https://blobs.blue/blob.is.helpful.fyi/post-image-thumb/3lpupqthpp22u`

    * `https://blobs.blue/blob.is.helpful.fyi/post-image-thumb/3lpupqthpp22u/1`

[<img src="https://blobs.blue/blob.is.helpful.fyi/post-image/3lpupqthpp22u" height="96">](https://blobs.blue/blob.is.helpful.fyi/post-image/3lpupqthpp22u)
[<img src="https://blobs.blue/blob.is.helpful.fyi/post-image/3lpupqthpp22u/1" height="96">](https://blobs.blue/blob.is.helpful.fyi/post-image/3lpupqthpp22u/1)
[<img src="https://blobs.blue/blob.is.helpful.fyi/post-image-thumb/3lpupqthpp22u/2" height="48">](https://blobs.blue/blob.is.helpful.fyi/post-image-thumb/3lpupqthpp22u/2)
[<img src="https://blobs.blue/blob.is.helpful.fyi/post-image-thumb/3lpupqthpp22u/3" height="48">](https://blobs.blue/blob.is.helpful.fyi/post-image-thumb/3lpupqthpp22u/3)

### Post Video

When it comes to a post video (video embed), with the current (Bluesky) schema, only one video is supported per post.
But has additional features, like fetching the raw video blob, video thumbnail, and video playlist/cue (m3u8).

* **Raw blob**:
    * `https://blobs.blue/{actor}/post-video/{postId}`
* **Additional**:
    * `https://blobs.blue/{actor}/post-video/{postId}/thumb`
    * `https://blobs.blue/{actor}/post-video/{postId}/playlist`
* **Examples**:
    * `https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u`
    * `https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u/thumb`
    * `https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u/playlist`

> [!NOTE]
> We're unable to display a video preview on GitHub. Please check the link below to see the video thumbnail,
> raw video blob, and playlist.

[<img src="https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u/thumb" height="96">](https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u/thumb)<br>
[Raw Video Blob](https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u)<br>
[Video Playlist](https://blobs.blue/blob.is.helpful.fyi/post-video/3lpupt4ybwc2u/playlist)

### Link Previews

If a post contains a link preview (external embed), you can fetch the preview image using the following URL format.
This is useful for getting the image of a link preview without having to parse the post content. If you want to
fetch the thumbnail, you can use the `/post-link-thumb` endpoint.

* **Full size**:
    * `https://blobs.blue/{actor}/post-link/{postId}`
* **Thumbnail**:
    * `https://blobs.blue/{actor}/post-link-thumb/{postId}`
* **Examples**:
    * `https://blobs.blue/blob.is.helpful.fyi/post-link/3lpvefnnqxk2e`
    * `https://blobs.blue/blob.is.helpful.fyi/post-link-thumb/3lpvefnnqxk2e`

[<img src="https://blobs.blue/blob.is.helpful.fyi/post-link/3lpvefnnqxk2e" height="96">](https://blobs.blue/blob.is.helpful.fyi/post-link/3lpvefnnqxk2e)
[<img src="https://blobs.blue/blob.is.helpful.fyi/post-link-thumb/3lpvefnnqxk2e" height="48">](https://blobs.blue/blob.is.helpful.fyi/post-link-thumb/3lpvefnnqxk2e)

## Blobs

If you want to access the raw blob, you can use the following URL format. Sometimes you need to access the raw blob for
deeper integration outside the Bluesky schema. This is useful for developers who want to build custom apps or tools.

> [!IMPORTANT]
> Please note that the raw blob you fetch may by any type of file, not just images. Because of this, you should always
> check the MIME type of the blob before using it in your application to avoid any issues.

* **Raw blob**:
    * `https://blobs.blue/{actor}/blob/{cid}`
* **Examples**:
    * `https://blobs.blue/bsky.app/blob/bafkreic5klrsqx3zmtv2rahuw3pdnohwgvgn44xas7h53ekg3bpkgbsnaq`
    * `https://blobs.blue/did:plc:z72i7hdynmk6r22z27h6tvur/blob/bafkreibti7g7jzet4nylzi5ojucw6eopj2kjqxgy53uy6yzk2uz377tw5u`

[<img src="https://blobs.blue/bsky.app/blob/bafkreic5klrsqx3zmtv2rahuw3pdnohwgvgn44xas7h53ekg3bpkgbsnaq" height="96">](https://blobs.blue/bsky.app/blob/bafkreic5klrsqx3zmtv2rahuw3pdnohwgvgn44xas7h53ekg3bpkgbsnaq)
[<img src="https://blobs.blue/did:plc:z72i7hdynmk6r22z27h6tvur/blob/bafkreibti7g7jzet4nylzi5ojucw6eopj2kjqxgy53uy6yzk2uz377tw5u" height="96">](https://blobs.blue/bsky.app/blob/bafkreibti7g7jzet4nylzi5ojucw6eopj2kjqxgy53uy6yzk2uz377tw5u)

## Formats

If you desire to get a specific format of the image, you can append the format to the URL.
Most formats are supported, including JPEG, PNG, WebP, GIF, etc.

* **Examples**:
    * `https://blobs.blue/{actor}@jpeg`
    * `https://blobs.blue/{actor}/banner@png`
    * `https://blobs.blue/{actor}/post-image/3lpupqthpp22u@webp`

[<img src="https://blobs.blue/bsky.app@jpeg" width="96">](https://blobs.blue/bsky.app@jpeg)
[<img src="https://blobs.blue/blob.is.helpful.fyi@png" width="96">](https://blobs.blue/blob.is.helpful.fyi@png)
[<img src="https://blobs.blue/federation.studio@webp" width="96">](https://blobs.blue/federation.studio@webp)

---

Built by [Federation Studio](https://federation.studio), for the federation.

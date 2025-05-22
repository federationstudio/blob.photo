# Blob Photo
[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy_to_Cloudflare-%23F38020?style=flat&logo=cloudflare&logoColor=ffffff)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Ffederationstudio%2Fblob.photo)

**Blob.photo** is a lightweight Cloudflare Worker that proxies **avatars, banners, post images, and blobs** from Bluesky’s CDN—no decoding, no API keys, no wasted bandwidth.

Built by [@federation.studio](https://bsky.app/profile/federation.studio)

## Table of Contents

<!-- TOC -->
* [Blob Photo](#blob-photo)
  * [Table of Contents](#table-of-contents)
* [Usage](#usage)
  * [Parameters](#parameters)
  * [Avatar](#avatar)
  * [Banners](#banners)
  * [Post Media](#post-media)
  * [Blobs](#blobs)
  * [Formats](#formats)
  * [Size (Thumbnails)](#size-thumbnails)
* [Examples](#examples)
<!-- TOC -->

# Usage
There are three types of images that can be proxied:
1. **Avatar**: The profile picture of a user.
2. **Banners**: The header image of a user profile.
3. **Post Media**: Images attached to a post.
4. **Blobs**: Individual blobs uploaded to PDS.

> [!IMPORTANT]
> This currently only works for images on the AT Protocol. Videos and other media types are not supported.

## Parameters
Here is a quick reference for the parameters used in the URLs:

**Required:**
- `{actor}`: The handle or DID of the user.
- `{post_id}`: The ID of the post.
- `{cid}`: The CID of the blob.

**Optional:**
- `[blob_index]`: The index of the blob in the post media array (optional).
- `[@format]`: The desired image format (optional).
- `[:sm]`: If present, the thumbnail image will be returned.

## Avatar
To get the avatar of a user, use the URL format below. This will return the profile picture of the user.

```
https://blob.photo/{actor}
https://blob.photo/{actor}/avatar

Example:
https://blob.photo/bsky.app
https://blob.photo/did:plc:ql2klqjmqhb52lae3jvsk5x4
```

[<img src="https://blob.photo/bsky.app" width="96">](https://blob.photo/bsky.app)
[<img src="https://blob.photo/did:plc:ql2klqjmqhb52lae3jvsk5x4" width="96">](https://blob.photo/did:plc:ql2klqjmqhb52lae3jvsk5x4)

## Banners
To get the banner of a user, use the URL format below. This will return the header image of the user's profile.
Unfortunately, `[:sm]` is not supported for blobs and will be ignored.

```
https://blob.photo/{actor}/banner

Example:
https://blob.photo/bsky.app/banner
```

[<img src="https://blob.photo/bsky.app/banner" height="96">](https://blob.photo/bsky.app/banner)

## Post Media
To get the media of a post, use the URL format below. The `[blob_index]` is optional and can be used
to specify which media blob to retrieve if there are multiple. If none is specified, the first blob
will be returned.

```
https://blob.photo/{actor}/post/{post_id}/[blob_index]

Example:
https://blob.photo/bsky.app/post/3lndjyecwcs2a
https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/post/3lmi3hmjsak24/1
```

[<img src="https://blob.photo/bsky.app/post/3lndjyecwcs2a" height="96">](https://blob.photo/bsky.app/post/3lndjyecwcs2a)
[<img src="https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/post/3lmi3hmjsak24/1" height="96">](https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/post/3lmi3hmjsak24/1)

## Blobs
To get a specific blob, use the URL format below. The `{cid}` is the CID of the blob you want
to retrieve. Unfortunately, `[@format]` and `[:sm]` is not supported for blobs and will be ignored.

```
https://blob.photo/{actor}/blob/{cid}

Example:
https://blob.photo/bsky.app/blob/bafkreic5klrsqx3zmtv2rahuw3pdnohwgvgn44xas7h53ekg3bpkgbsnaq
https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/blob/bafkreibti7g7jzet4nylzi5ojucw6eopj2kjqxgy53uy6yzk2uz377tw5u
```

[<img src="https://blob.photo/bsky.app/blob/bafkreic5klrsqx3zmtv2rahuw3pdnohwgvgn44xas7h53ekg3bpkgbsnaq" height="96">](https://blob.photo/bsky.app/blob/bafkreic5klrsqx3zmtv2rahuw3pdnohwgvgn44xas7h53ekg3bpkgbsnaq)
[<img src="https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/blob/bafkreibti7g7jzet4nylzi5ojucw6eopj2kjqxgy53uy6yzk2uz377tw5u" height="96">](https://blob.photo/bsky.app/blob/bafkreibti7g7jzet4nylzi5ojucw6eopj2kjqxgy53uy6yzk2uz377tw5u)

## Formats
If you desire to get a specific format of the image, you can append the format to the URL.
Most formats are supported, including JPEG, PNG, WebP, GIF, etc.

```
https://blob.photo/{actor}@jpeg
https://blob.photo/{actor}/banner@png
https://blob.photo/{actor}/post/{post_id}/[blob_index]@webp
```

## Size (Thumbnails)
To get a thumbnail of the image, you can append `[:sm]` to the image type in the URL. The
thumbnail will be a smaller version of the original image.

> [!IMPORTANT]
> Currently, Bluesky only supports thumbnails for avatars and post media. Banners nor blobs support this feature.

```
https://blob.photo/{actor}:sm
https://blob.photo/{actor}/avatar:sm
https://blob.photo/{actor}/post:sm/{post_id}
https://blob.photo/{actor}/post:sm/{post_id}/[blob_index]
```
[<img src="https://blob.photo/bsky.app:sm" width="48">](https://blob.photo/bsky.app:sm)
[<img src="https://blob.photo/federation.studio/avatar:sm" width="48">](https://blob.photo/federation.studio/avatar:sm)
[<img src="https://blob.photo/bsky.app/post:sm/3lndjyecwcs2a" height="48">](https://blob.photo/bsky.app/post:sm/3lndjyecwcs2a)
[<img src="https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/post:sm/3lmi3hmjsak24/1" height="48">](https://blob.photo/did:plc:z72i7hdynmk6r22z27h6tvur/post:sm/3lmi3hmjsak24/1)

# Examples
[<img src="https://blob.photo/bsky.app@jpeg" width="96">](https://blob.photo/bsky.app@jpeg)
[<img src="https://blob.photo/federation.studio@png" width="96">](https://blob.photo/federation.studio@png)
[<img src="https://blob.photo/daniel.fanara.co@webp" width="96">](https://blob.photo/daniel.fanara.co@webp)
[<img src="https://blob.photo/btrs.co@gif" width="96">](https://blob.photo/btrs.co@gif)

[<img src="https://blob.photo/bsky.app/banner" height="96">](https://blob.photo/bsky.app/banner)
[<img src="https://blob.photo/federation.studio/banner" height="96">](https://blob.photo/federation.studio/banner)

---

<center>
    Built by <a href="https://federation.studio">Federation Studio</a>, for the federation.
</center>

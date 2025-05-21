# Blob Photo
Blob.photo is a minimal Bluesky image proxy that redirects avatar, banner, and post media requests to Bluesky’s CDN.
Built with Cloudflare Workers, it is designed to be fast and efficient.

Created by [@federation.studio](https://bsky.app/profile/federation.studio) for use in future projects.

## Table of Contents

<!-- TOC -->
* [Blob Photo](#blob-photo)
  * [Table of Contents](#table-of-contents)
* [Usage](#usage)
  * [Variables](#variables)
  * [Avatar](#avatar)
  * [Banners](#banners)
  * [Post Media](#post-media)
  * [Formats](#formats)
* [Examples](#examples)
<!-- TOC -->

# Usage
There are three types of images that can be proxied:
1. **Avatar**: The profile picture of a user.
2. **Banners**: The header image of a user profile.
3. **Post Media**: Images attached to a post.

> [!IMPORTANT]
> This currently only works for images on the AT Protocol. Videos and other media types are not supported.

## Variables
Here is a quick reference for the variables used in the URLs:

- `{actor}`: The handle or DID of the user.
- `{post_id}`: The ID of the post.
- `{blob_index?}`: The index of the blob in the post media array (optional).

## Avatar
To get the avatar of a user, use the URL format below. This will return the profile picture of the user.

```
https://blob.photo/{actor}

Example:
https://blob.photo/bsky.app
```

[<img src="https://blob.photo/bsky.app" width="96">](https://blob.photo/bsky.app)

## Banners
To get the banner of a user, use the URL format below. This will return the header image of the user's profile.

```
https://blob.photo/{actor}/banner

Example:
https://blob.photo/bsky.app/banner
```

[<img src="https://blob.photo/bsky.app/banner" height="96">](https://blob.photo/bsky.app/banner)

## Post Media
To get the media of a post, use the URL format below. The `{blob_index}` is optional and can be used
to specify which media blob to retrieve if there are multiple. If none is specified, the first blob
will be returned.

```
https://blob.photo/{actor}/post/{post_id}/{blob_index?}

Example:
https://blob.photo/bsky.app/post/3lndjyecwcs2a
https://blob.photo/bsky.app/post/3lmi3hmjsak24/1
```

[<img src="https://blob.photo/bsky.app/post/3lndjyecwcs2a" height="96">](https://blob.photo/bsky.app/post/3lndjyecwcs2a)
[<img src="https://blob.photo/bsky.app/post/3lmi3hmjsak24/1" height="96">](https://blob.photo/bsky.app/post/3lmi3hmjsak24/1)

## Formats
If you desire to get a specific format of the image, you can append the format to the URL.
Most formats are supported, including JPEG, PNG, WebP, GIF, etc.

```
https://blob.photo/{actor}@jpeg
https://blob.photo/{actor}/banner@png
https://blob.photo/{actor}/post/{post_id}/{blob_index?}@webp
```

# Examples
[<img src="https://blob.photo/bsky.app@jpeg" width="96">](https://blob.photo/bsky.app@jpeg)
[<img src="https://blob.photo/federation.studio@png" width="96">](https://blob.photo/federation.studio@png)
[<img src="https://blob.photo/daniel.fanara.co@webp" width="96">](https://blob.photo/daniel.fanara.co@webp)
[<img src="https://blob.photo/btrs.co@gif" width="96">](https://blob.photo/btrs.co@gif)

[<img src="https://blob.photo/bsky.app/banner" height="96">](https://blob.photo/bsky.app/banner)
[<img src="https://blob.photo/federation.studio/banner" height="96">](https://blob.photo/federation.studio/banner)

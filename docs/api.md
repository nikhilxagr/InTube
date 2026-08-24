# API Specification

All endpoints are namespaced under `/api/v1`. All JSON responses follow a standardized payload structure.

---

## 1. Response Envelope Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable error description"
  }
}
```

### Standard Error Codes
| Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `INVALID_URL` | 400 | The URL supplied is invalid, malformed, or targets a forbidden network range (SSRF guard). |
| `UNSUPPORTED_PLATFORM` | 400 | The platform or domain is not supported by any registered provider. |
| `UNSUPPORTED_MEDIA` | 400 | The specific media URL type is not supported (e.g. private or livestreams). |
| `AUTHORIZATION_REQUIRED` | 403 | The content is private or requires authentication that is not permitted. |
| `PROVIDER_UNAVAILABLE` | 503 | The upstream provider failed to respond or is experiencing outages. |
| `MEDIA_UNAVAILABLE` | 404 | The requested media was deleted, private, or cannot be found. |
| `INVALID_MEDIA_FILE` | 400 | The uploaded file is not a valid video or audio format. |
| `UNSUPPORTED_FILE` | 400 | File format or MIME type is not supported. |
| `THUMBNAIL_UNAVAILABLE` | 404 | The media has no exposed public cover image. |
| `TRANSFER_EXPIRED` | 410 | The 10-minute temporary QR transfer window has elapsed. |
| `TRANSFER_NOT_FOUND` | 404 | Transfer record does not exist or was already purged. |
| `PROCESSING_FAILED` | 500 | Media transformation, conversion, or muxing failed during processing. |
| `FILE_TOO_LARGE` | 413 | The requested media exceeds the maximum configured file size limit. |
| `PROCESSING_TIMEOUT` | 504 | Media processing took longer than the configured timeout window. |
| `RATE_LIMITED` | 429 | The client has exceeded the allowable request rate. |
| `UNKNOWN_ERROR` | 500 | An unexpected internal error occurred. |

---

## 2. Endpoints

### 2.1 Health Check
- **URL**: `/api/v1/health`
- **Method**: `GET`

### 2.2 URL Downloader Endpoints

#### Analyze Media URL
- **URL**: `/api/v1/media/analyze`
- **Method**: `POST`
- **Body**: `{ "url": "https://www.youtube.com/watch?v=..." }`

#### Download Media Stream
- **URL**: `/api/v1/media/download`
- **Method**: `POST`
- **Body**: `{ "url": "...", "formatId": "1080p", "container": "mp4", "type": "video" }`
- **Response**: Binary stream (`Content-Disposition: attachment; filename="..."`)

---

### 2.3 Media Toolkit Endpoints

#### Inspect Local Media Metadata
- **URL**: `/api/v1/tools/inspect`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` (`file`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "filename": "sample.mp4",
    "sizeBytes": 25690112,
    "sizeFormatted": "24.50 MB",
    "duration": 201.4,
    "durationFormatted": "3:21",
    "video": {
      "codec": "h264",
      "resolution": "1920x1080",
      "fps": 30
    },
    "audio": {
      "codec": "aac",
      "sampleRate": "44100 Hz",
      "channels": 2,
      "bitrate": "128 kbps"
    }
  }
}
```

#### Video to Audio Converter
- **URL**: `/api/v1/tools/video-to-audio`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` (`file`, `format`: `mp3`\|`m4a`\|`wav`\|`aac`\|`ogg`, `bitrate`: `128k`\|`192k`\|`256k`\|`320k`)
- **Response**: Binary audio stream (`attachment; filename="output.mp3"`)

#### Video Format Converter
- **URL**: `/api/v1/tools/convert`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` (`file`, `format`: `mp4`\|`webm`\|`mov`, `quality`: `balanced`\|`high`\|`small`)
- **Response**: Binary video stream (`attachment; filename="output.mp4"`)

#### HD Thumbnail Extractor
- **URL**: `/api/v1/tools/thumbnail`
- **Method**: `POST`
- **Body**: `{ "url": "https://www.youtube.com/watch?v=..." }`
- **Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://www.youtube.com/watch?v=...",
    "title": "Video Title",
    "platform": "youtube",
    "thumbnail": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
    "formats": [
      { "format": "jpg", "label": "JPG Image", "url": "..." },
      { "format": "png", "label": "PNG Image", "url": "..." }
    ]
  }
}
```

---

### 2.4 QR Mobile Transfer Endpoints

#### Create Transfer Token
- **URL**: `/api/v1/transfer/create`
- **Method**: `POST`
- **Body**: `{ "jobId": "uuid-v4-string" }`
- **Response**:
```json
{
  "success": true,
  "data": {
    "token": "64_char_crypto_hex_token",
    "expiresAt": 1771980000000,
    "filename": "media_video.mp4",
    "size": 25690112
  }
}
```

#### Get Mobile Transfer Details
- **URL**: `/api/v1/transfer/:token`
- **Method**: `GET`
- **Response**:
```json
{
  "success": true,
  "data": {
    "token": "64_char_crypto_hex_token",
    "filename": "media_video.mp4",
    "title": "Media Title",
    "size": 25690112,
    "expiresAt": 1771980000000,
    "remainingSeconds": 580
  }
}
```

#### Download File to Mobile Device
- **URL**: `/api/v1/transfer/:token/download`
- **Method**: `GET`
- **Response**: Direct binary stream

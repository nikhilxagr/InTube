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
| `PROCESSING_FAILED` | 500 | Media transformation, conversion, or muxing failed during processing. |
| `FILE_TOO_LARGE` | 413 | The requested media exceeds the maximum configured file size limit. |
| `PROCESSING_TIMEOUT` | 504 | Media processing took longer than the configured timeout window. |
| `RATE_LIMITED` | 429 | The client has exceeded the allowable request rate. |
| `UNKNOWN_ERROR` | 500 | An unexpected internal error occurred. |

---

## 2. Endpoints

### 2.1 Health Check
Inspects application status, memory usage, and uptime.

- **URL**: `/api/v1/health`
- **Method**: `GET`
- **Auth**: None
- **Rate Limit**: Default limiter

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "intube-backend",
    "version": "1.0.0",
    "timestamp": "2026-08-19T02:00:00.000Z",
    "uptime": 124.5,
    "providers": ["youtube", "instagram"]
  }
}
```

---

### 2.2 Analyze Media URL
Validates a user-supplied URL, resolves the provider, fetches real metadata, and returns available format options.

- **URL**: `/api/v1/media/analyze`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "platform": "youtube",
    "type": "video",
    "id": "dQw4w9WgXcQ",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Rick Astley - Never Gonna Give You Up",
    "author": "Rick Astley",
    "duration": 213,
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "formats": [
      {
        "formatId": "video_1080p",
        "container": "mp4",
        "quality": "1080p",
        "type": "video",
        "hasAudio": true,
        "hasVideo": true,
        "approxSize": 45120000
      },
      {
        "formatId": "video_720p",
        "container": "mp4",
        "quality": "720p",
        "type": "video",
        "hasAudio": true,
        "hasVideo": true,
        "approxSize": 22100000
      },
      {
        "formatId": "audio_mp3",
        "container": "mp3",
        "quality": "Audio 320kbps",
        "type": "audio",
        "hasAudio": true,
        "hasVideo": false,
        "approxSize": 5100000
      }
    ]
  }
}
```

---

### 2.3 Process & Download Media
Processes the media file according to requested parameters and streams the output directly to the client.

- **URL**: `/api/v1/media/download`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "formatId": "video_720p",
  "container": "mp4",
  "type": "video"
}
```

#### Response (200 OK)
- **Headers**:
  - `Content-Type: video/mp4` (or `audio/mpeg`)
  - `Content-Disposition: attachment; filename="Rick_Astley_-_Never_Gonna_Give_You_Up_720p.mp4"`
  - `Content-Length: <file size>`
- **Body**: Binary Stream

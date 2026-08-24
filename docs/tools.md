# InTube Media Tools Reference

Comprehensive documentation for all media processing utilities and API endpoints available in the InTube Universal Media Toolkit.

---

## 1. Batch URL Downloader (`/tools/batch`)

- **Route**: `POST /api/v1/tools/batch/analyze` (also `/api/tools/batch/analyze`)
- **Payload**:
  ```json
  {
    "urls": [
      "https://www.youtube.com/watch?v=...",
      "https://www.instagram.com/reel/..."
    ]
  }
  ```
- **Constraints**:
  - Maximum 5 URLs per batch request (`MAX_BATCH_SIZE = 5`).
  - Automatic URL deduplication.
  - Returns array of `{ url, status: 'ready' | 'error', metadata, error }`.

---

## 2. Video → Image Frame Extractor (`/tools/video-to-image`)

- **Route**: `POST /api/v1/tools/video-to-image`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: Video file (`.mp4`, `.webm`, `.mov`, `.mkv`, `.avi`)
  - `mode`: `'first_frame'` | `'timestamp'` | `'interval'`
  - `timestamp`: `'00:00:05.000'` (used when mode is `timestamp`)
  - `interval`: `number` in seconds, e.g. `5` (used when mode is `interval`)
  - `format`: `'jpg'` | `'png'` | `'webp'`
- **Behavior**:
  - Single frame modes stream directly with image `Content-Type`.
  - Interval mode packages up to 30 frames into a compressed `.zip` stream via `archiver`.

---

## 3. Audio Converter (`/tools/audio-converter`)

- **Route**: `POST /api/v1/tools/audio-converter`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: Audio file (`.mp3`, `.m4a`, `.wav`, `.aac`, `.ogg`, `.flac`, `.opus`)
  - `format`: `'mp3'` | `'m4a'` | `'wav'` | `'aac'` | `'ogg'`
  - `bitrate`: `'128k'` | `'192k'` | `'256k'` | `'320k'`
- **Behavior**:
  - WAV output applies uncompressed 16-bit PCM (`pcm_s16le`).
  - MP3 uses `libmp3lame` CBR.
  - M4A/AAC uses `aac` encoder.
  - OGG uses `libvorbis`.

---

## 4. Image Processing Suite (`/tools/image`)

### 4.1 Image Converter (`/tools/image/convert`)
- **Route**: `POST /api/v1/tools/image/convert`
- **Fields**:
  - `file`: Image file (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`)
  - `format`: `'webp'` | `'jpg'` | `'png'` | `'avif'`
  - `quality`: `number` (10-100, default `85`)

### 4.2 Image Compressor (`/tools/image/compress`)
- **Route**: `POST /api/v1/tools/image/compress`
- **Fields**:
  - `file`: Image file
  - `quality`: `number` (10-100, default `75`)
- **Response Headers**:
  - `x-original-size`: Original byte size
  - `x-output-size`: Compressed byte size
  - `x-reduction-percent`: Percentage reduction (e.g. `58`)

### 4.3 Image Resizer (`/tools/image/resize`)
- **Route**: `POST /api/v1/tools/image/resize`
- **Fields**:
  - `file`: Image file
  - `width`: `number` (pixels)
  - `height`: `number` (pixels)
  - `allowUpscale`: `boolean` (`false` by default to prevent pixelation)

---

## 5. Security & Resource Controls

- **Decompression Bomb Guard**: Sharp pixel checks strictly enforce `MAX_IMAGE_PIXELS = 25,000,000` (25 Megapixels).
- **Upload Limit**: Multipart uploads capped at 50 MB (`MAX_UPLOAD_SIZE_BYTES = 52,428,800`).
- **Processing Timeout**: Hard timeouts at 180 seconds (`MAX_PROCESSING_TIME_SECONDS = 180`).
- **Path Sanitization**: All file outputs utilize `generateSafeFilename` avoiding path traversal and control characters.

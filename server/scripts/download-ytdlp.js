import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const binDir = path.resolve(__dirname, '../bin');
const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.join(binDir, binaryName);

const downloadUrl = isWindows
  ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
  : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

if (fs.existsSync(binaryPath)) {
  console.log(`[setup] yt-dlp binary already exists at: ${binaryPath}`);
  process.exit(0);
}

console.log(`[setup] Downloading standalone yt-dlp binary from ${downloadUrl}...`);

function downloadFile(url, dest, callback) {
  https.get(url, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      return downloadFile(response.headers.location, dest, callback);
    }

    if (response.statusCode !== 200) {
      return callback(new Error(`Failed to download: HTTP ${response.statusCode}`));
    }

    const file = fs.createWriteStream(dest);
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        if (!isWindows) {
          try {
            fs.chmodSync(dest, 0o755);
          } catch {}
        }
        callback(null);
      });
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    callback(err);
  });
}

downloadFile(downloadUrl, binaryPath, (err) => {
  if (err) {
    console.warn(`[setup] Notice: Could not download standalone yt-dlp: ${err.message}. Relying on system yt-dlp.`);
  } else {
    console.log(`[setup] Successfully installed yt-dlp binary at: ${binaryPath}`);
  }
});

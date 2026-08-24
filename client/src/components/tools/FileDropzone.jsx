import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileVideo, FileAudio, File, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function FileDropzone({
  onFileSelected,
  selectedFile = null,
  onClear = null,
  accept = 'video/*,audio/*',
  maxSizeMB = 50,
  label = 'Drop your media file here',
  description = 'Supports MP4, WebM, MOV, MKV, MP3, WAV, and more'
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorHint, setErrorHint] = useState('');
  const inputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback((file) => {
    if (!file) return false;

    if (file.size > maxSizeBytes) {
      setErrorHint(`File exceeds maximum size of ${maxSizeMB}MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return false;
    }

    // Basic extension check
    const ext = file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = [
      'mp4', 'webm', 'mov', 'mkv', 'avi', 'flv', 'wmv', '3gp', 'm4v',
      'mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac', 'opus',
      'jpg', 'jpeg', 'png', 'webp'
    ];

    if (ext && !acceptedExts.includes(ext)) {
      setErrorHint(`File format .${ext} is not supported.`);
      return false;
    }

    setErrorHint('');
    return true;
  }, [maxSizeBytes, maxSizeMB]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        onFileSelected(droppedFile);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const picked = e.target.files[0];
      if (validateFile(picked)) {
        onFileSelected(picked);
      }
    }
  };

  const handleClickBrowse = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClickBrowse();
    }
  };

  const getFileIcon = (fileName = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'].includes(ext)) {
      return <FileAudio className="w-8 h-8 text-pink-500" />;
    }
    if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) {
      return <FileVideo className="w-8 h-8 text-purple-500" />;
    }
    return <File className="w-8 h-8 text-blue-500" />;
  };

  if (selectedFile) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-purple-500/40 shadow-xl backdrop-blur-xl transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
              {getFileIcon(selectedFile.name)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {selectedFile.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span>•</span>
                <span className="uppercase">{selectedFile.name.split('.').pop()}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              title="Remove file"
              aria-label="Remove selected file"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClickBrowse}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Upload media file dropzone"
        className={`relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3.5 group select-none ${
          isDragOver
            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-4 ring-purple-500/20 shadow-2xl scale-[1.01]'
            : 'border-slate-300/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/60 hover:border-purple-400 dark:hover:border-purple-500/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 shadow-md'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${
            isDragOver
              ? 'bg-purple-600 text-white shadow-purple-500/40'
              : 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/60'
          }`}
        >
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <p className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            {label}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {description}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="text-xs font-bold pointer-events-none"
          >
            Browse from Device
          </Button>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            (Max file size: {maxSizeMB}MB)
          </span>
        </div>
      </div>

      {errorHint && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 px-1">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorHint}</span>
        </div>
      )}
    </div>
  );
}

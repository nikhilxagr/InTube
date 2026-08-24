import { Info } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function MetadataTool() {
  const {
    state,
    file,
    metadata,
    errorMessage,
    selectFile,
    setInspecting,
    setReady,
    setError,
    reset,
    isInspecting
  } = useFileProcessor();

  const handleFilePicked = async (pickedFile) => {
    selectFile(pickedFile);
    setInspecting();

    try {
      const meta = await ToolsService.inspectFile(pickedFile);
      setReady(meta);
    } catch (err) {
      setError(err?.message || 'Unable to read media metadata from this file.');
    }
  };

  return (
    <ToolLayout
      title="Media Metadata Inspector"
      description="Inspect deep technical metadata (codecs, bitrate, streams, resolution, fps) from local audio and video files using FFmpeg."
      category="Media Utilities"
      badgeVariant="secondary"
      icon={Info}
      seoTitle="Media Metadata Inspector - Codecs, Bitrate & Resolution"
      seoDescription="Inspect local video and audio metadata with FFmpeg. Check codecs, frame rate, audio channels, bitrate, and resolution."
    >
      <div className="space-y-6">
        <FileDropzone
          onFileSelected={handleFilePicked}
          selectedFile={file}
          onClear={reset}
          accept="video/*,audio/*,image/*"
          label="Drop any media file to inspect metadata"
          description="Supports MP4, MKV, MOV, WebM, AVI, MP3, WAV, FLAC, JPG, PNG (Up to 50MB)"
        />

        {isInspecting && (
          <ProcessingState
            statusText="Inspecting media streams with FFmpeg..."
            subText="Reading container headers, stream descriptors, and audio/video codecs."
          />
        )}

        {state === PROCESSOR_STATES.ERROR && (
          <ProcessingState
            isError
            errorMessage={errorMessage}
            onCancel={reset}
          />
        )}

        {metadata && (
          <div className="space-y-6">
            <MediaInfo metadata={metadata} />

            <div className="text-center">
              <Button size="sm" variant="outline" onClick={reset} className="text-xs">
                Inspect Another File
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

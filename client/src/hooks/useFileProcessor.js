import { useState, useCallback } from 'react';

export const PROCESSOR_STATES = {
  IDLE: 'IDLE',
  FILE_SELECTED: 'FILE_SELECTED',
  VALIDATING: 'VALIDATING',
  INSPECTING: 'INSPECTING',
  READY: 'READY',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

export function useFileProcessor(initialState = PROCESSOR_STATES.IDLE) {
  const [state, setState] = useState(initialState);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);

  const selectFile = useCallback((selectedFile) => {
    setFile(selectedFile);
    setMetadata(null);
    setResult(null);
    setErrorMessage('');
    setProgress(null);
    setState(PROCESSOR_STATES.FILE_SELECTED);
  }, []);

  const setInspecting = useCallback(() => {
    setState(PROCESSOR_STATES.INSPECTING);
    setErrorMessage('');
  }, []);

  const setReady = useCallback((meta = null) => {
    if (meta) setMetadata(meta);
    setState(PROCESSOR_STATES.READY);
  }, []);

  const setProcessing = useCallback((initialProgress = null) => {
    setState(PROCESSOR_STATES.PROCESSING);
    setProgress(initialProgress);
    setErrorMessage('');
  }, []);

  const setCompleted = useCallback((outputResult) => {
    setResult(outputResult);
    setState(PROCESSOR_STATES.COMPLETED);
    setProgress(null);
  }, []);

  const setError = useCallback((msg) => {
    setErrorMessage(typeof msg === 'string' ? msg : msg?.message || 'An unexpected error occurred.');
    setState(PROCESSOR_STATES.ERROR);
    setProgress(null);
  }, []);

  const reset = useCallback(() => {
    setState(PROCESSOR_STATES.IDLE);
    setFile(null);
    setMetadata(null);
    setResult(null);
    setErrorMessage('');
    setProgress(null);
  }, []);

  return {
    state,
    file,
    metadata,
    errorMessage,
    result,
    progress,
    setState,
    selectFile,
    setInspecting,
    setReady,
    setProcessing,
    setCompleted,
    setError,
    setProgress,
    reset,
    isIdle: state === PROCESSOR_STATES.IDLE,
    isProcessing: state === PROCESSOR_STATES.PROCESSING,
    isInspecting: state === PROCESSOR_STATES.INSPECTING,
    isCompleted: state === PROCESSOR_STATES.COMPLETED,
    isReady: state === PROCESSOR_STATES.READY,
    isError: state === PROCESSOR_STATES.ERROR
  };
}

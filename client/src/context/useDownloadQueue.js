import { useContext } from 'react';
import { DownloadQueueContext } from './downloadQueueInstance.js';

export function useDownloadQueue() {
  const context = useContext(DownloadQueueContext);
  if (!context) {
    throw new Error('useDownloadQueue must be used within a DownloadQueueProvider');
  }
  return context;
}

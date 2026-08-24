import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaService } from '../services/media.service.js';
import { QUEUE_STATUS } from './downloadQueueConstants.js';
import { DownloadQueueContext } from './downloadQueueInstance.js';

const MAX_CONCURRENT_DOWNLOADS = 2;

export function DownloadQueueProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const activeCountRef = useRef(0);
  const isProcessingRef = useRef(false);

  // Add one or multiple items to queue
  const addToQueue = useCallback((items) => {
    const newItems = (Array.isArray(items) ? items : [items]).map((item) => ({
      id: item.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      url: item.url,
      title: item.title || item.url,
      platform: item.platform || 'media',
      type: item.type || 'video',
      format: item.format || { formatId: 'best', container: 'mp4' },
      status: QUEUE_STATUS.QUEUED,
      progress: null,
      error: null,
      result: null,
      createdAt: Date.now()
    }));

    setQueue((prev) => [...prev, ...newItems]);
    setIsDrawerOpen(true);
  }, []);

  const cancelItem = useCallback((id) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: QUEUE_STATUS.CANCELLED } : item))
    );
  }, []);

  const retryItem = useCallback((id) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: QUEUE_STATUS.QUEUED, error: null, progress: null } : item
      )
    );
  }, []);

  const removeItem = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((item) => item.status !== QUEUE_STATUS.COMPLETED));
  }, []);

  // Sequential queue processor with concurrency limit of 2
  const processNextInQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setQueue((currentQueue) => {
        const activeCount = currentQueue.filter(
          (item) => item.status === QUEUE_STATUS.PROCESSING || item.status === QUEUE_STATUS.ANALYZING
        ).length;

        activeCountRef.current = activeCount;

        if (activeCount >= MAX_CONCURRENT_DOWNLOADS) {
          return currentQueue;
        }

        const nextItem = currentQueue.find((item) => item.status === QUEUE_STATUS.QUEUED);
        if (!nextItem) {
          return currentQueue;
        }

        // Start processing next item asynchronously
        (async () => {
          try {
            setQueue((q) =>
              q.map((it) => (it.id === nextItem.id ? { ...it, status: QUEUE_STATUS.PROCESSING } : it))
            );

            const res = await MediaService.download(
              {
                url: nextItem.url,
                formatId: nextItem.format?.formatId || 'video_1080p_mp4',
                container: nextItem.format?.container || 'mp4',
                type: nextItem.type || 'video'
              },
              (progress) => {
                setQueue((q) =>
                  q.map((it) => (it.id === nextItem.id ? { ...it, progress } : it))
                );
              }
            );

            setQueue((q) =>
              q.map((it) =>
                it.id === nextItem.id
                  ? { ...it, status: QUEUE_STATUS.COMPLETED, result: res, progress: { percent: 100 } }
                  : it
              )
            );
          } catch (err) {
            setQueue((q) =>
              q.map((it) =>
                it.id === nextItem.id
                  ? { ...it, status: QUEUE_STATUS.FAILED, error: err.message || 'Download failed' }
                  : it
              )
            );
          }
        })();

        return currentQueue;
      });
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const hasQueued = queue.some((item) => item.status === QUEUE_STATUS.QUEUED);
    const activeCount = queue.filter(
      (item) => item.status === QUEUE_STATUS.PROCESSING || item.status === QUEUE_STATUS.ANALYZING
    ).length;

    if (hasQueued && activeCount < MAX_CONCURRENT_DOWNLOADS) {
      processNextInQueue();
    }
  }, [queue, processNextInQueue]);

  return (
    <DownloadQueueContext.Provider
      value={{
        queue,
        addToQueue,
        cancelItem,
        retryItem,
        removeItem,
        clearCompleted,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
        activeCount: queue.filter(
          (item) => item.status === QUEUE_STATUS.PROCESSING || item.status === QUEUE_STATUS.QUEUED
        ).length
      }}
    >
      {children}
    </DownloadQueueContext.Provider>
  );
}

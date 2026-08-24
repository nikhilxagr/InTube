import {
  ListOrdered,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RotateCcw,
  Ban,
  Download
} from 'lucide-react';
import { useDownloadQueue } from '../../context/useDownloadQueue.js';
import { QUEUE_STATUS } from '../../context/downloadQueueConstants.js';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';

export function DownloadQueueDrawer() {
  const {
    queue,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    cancelItem,
    retryItem,
    removeItem,
    clearCompleted,
    activeCount
  } = useDownloadQueue();

  if (queue.length === 0 && !isDrawerOpen) {
    return null;
  }

  const completedCount = queue.filter((i) => i.status === QUEUE_STATUS.COMPLETED).length;

  return (
    <>
      {/* Floating Queue Bar / Trigger Button */}
      {queue.length > 0 && !isDrawerOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-fadeIn">
          <button
            type="button"
            onClick={openDrawer}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all border border-white/20"
          >
            <ListOrdered className="w-4 h-4" />
            <span>Download Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono">
              {activeCount > 0 ? `${activeCount} active` : `${queue.length} total`}
            </span>
          </button>
        </div>
      )}

      {/* Drawer Modal */}
      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Download Queue"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="fixed inset-0" onClick={closeDrawer} />

          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Download Queue
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Max 2 concurrent jobs • {queue.length} items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {completedCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearCompleted}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white p-1.5"
                    title="Clear completed downloads"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear done
                  </Button>
                )}

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Queue Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {queue.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Download className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-semibold">Queue is empty</p>
                  <p className="text-xs text-slate-500">
                    Items added from Batch Downloader or manual queues will appear here.
                  </p>
                </div>
              ) : (
                queue.map((item) => {
                  const isProcessing = item.status === QUEUE_STATUS.PROCESSING;
                  const isCompleted = item.status === QUEUE_STATUS.COMPLETED;
                  const isFailed = item.status === QUEUE_STATUS.FAILED;
                  const isCancelled = item.status === QUEUE_STATUS.CANCELLED;
                  const isQueued = item.status === QUEUE_STATUS.QUEUED;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isProcessing
                          ? 'border-blue-500/50 bg-blue-50/60 dark:bg-blue-950/40'
                          : isCompleted
                          ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : isFailed
                          ? 'border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge
                              size="sm"
                              variant={
                                isCompleted
                                  ? 'success'
                                  : isFailed
                                  ? 'error'
                                  : isProcessing
                                  ? 'brand'
                                  : 'neutral'
                              }
                            >
                              {isProcessing && <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />}
                              {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                              {isFailed && <AlertCircle className="w-2.5 h-2.5 mr-1" />}
                              {isQueued && <Clock className="w-2.5 h-2.5 mr-1" />}
                              {isCancelled && <Ban className="w-2.5 h-2.5 mr-1" />}
                              {item.status}
                            </Badge>

                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {item.platform}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {item.url}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isProcessing && (
                            <button
                              type="button"
                              onClick={() => cancelItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                              title="Cancel download"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isFailed && (
                            <button
                              type="button"
                              onClick={() => retryItem(item.id)}
                              className="p-1 text-slate-400 hover:text-blue-500 rounded-lg"
                              title="Retry download"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                            title="Remove from queue"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {isProcessing && item.progress?.percent !== undefined && (
                        <div className="mt-3 space-y-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${item.progress.percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>{Math.round(item.progress.percent)}%</span>
                            {item.progress.speed && <span>{item.progress.speed}</span>}
                          </div>
                        </div>
                      )}

                      {/* Error text */}
                      {isFailed && item.error && (
                        <p className="mt-2 text-[11px] text-rose-500 dark:text-rose-400">
                          {item.error}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useMemo } from 'react';
import { Layers, ListOrdered, CheckCircle2, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ToolsService } from '../../services/tools.service.js';
import { useDownloadQueue } from '../../context/useDownloadQueue.js';

const MAX_BATCH_LIMIT = 5;

export function BatchDownloader() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const { addToQueue } = useDownloadQueue();

  // Parse raw text into unique URLs
  const { validUrls, duplicatesCount, invalidCount } = useMemo(() => {
    if (!inputText.trim()) {
      return { validUrls: [], duplicatesCount: 0, invalidCount: 0 };
    }

    const rawLines = inputText.split(/[\r\n,]+/).map((l) => l.trim()).filter(Boolean);
    const seen = new Set();
    const valid = [];
    let dups = 0;
    let inv = 0;

    for (const raw of rawLines) {
      try {
        const u = new URL(raw);
        if (['http:', 'https:'].includes(u.protocol)) {
          if (seen.has(raw)) {
            dups++;
          } else {
            seen.add(raw);
            valid.push(raw);
          }
        } else {
          inv++;
        }
      } catch {
        inv++;
      }
    }

    return { validUrls: valid, duplicatesCount: dups, invalidCount: inv };
  }, [inputText]);

  const handleAnalyzeAll = async () => {
    if (validUrls.length === 0) return;
    if (validUrls.length > MAX_BATCH_LIMIT) {
      setErrorMessage(`Please limit your batch to a maximum of ${MAX_BATCH_LIMIT} URLs.`);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setBatchResults([]);

    try {
      const res = await ToolsService.batchAnalyze(validUrls);
      const items = res.data?.items || [];
      setBatchResults(items);

      // Select all ready items by default
      const readySet = new Set(items.filter((it) => it.status === 'ready').map((it) => it.url));
      setSelectedUrls(readySet);
    } catch (err) {
      setErrorMessage(err.message || 'Batch analysis failed. Please verify your URLs.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelectUrl = (url) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleAddSelectedToQueue = () => {
    const itemsToQueue = batchResults
      .filter((item) => selectedUrls.has(item.url) && item.status === 'ready')
      .map((item) => ({
        url: item.url,
        title: item.metadata?.title || item.url,
        platform: item.metadata?.platform || 'media',
        type: item.metadata?.type || 'video',
        format: item.metadata?.formats?.[0] || { formatId: 'best', container: 'mp4' }
      }));

    if (itemsToQueue.length > 0) {
      addToQueue(itemsToQueue);
      // Reset form
      setInputText('');
      setBatchResults([]);
      setSelectedUrls(new Set());
    }
  };

  return (
    <ToolLayout
      title="Batch URL Downloader"
      description="Paste up to 5 YouTube, Instagram, or Facebook links to analyze and queue them in a single batch."
      icon={Layers}
      category="Downloaders"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <Card className="p-6 sm:p-7 space-y-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Paste Media URLs (1 per line)
            </label>
            <span className="text-xs font-semibold text-slate-400">
              {validUrls.length} / {MAX_BATCH_LIMIT} max
            </span>
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=...&#10;https://www.instagram.com/reel/...&#10;https://www.facebook.com/watch/..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Validation Metrics */}
          {inputText.trim() && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ {validUrls.length} Valid
              </span>
              {duplicatesCount > 0 && (
                <span className="text-amber-500 font-medium">
                  • {duplicatesCount} duplicate filtered
                </span>
              )}
              {invalidCount > 0 && (
                <span className="text-rose-500 font-medium">
                  • {invalidCount} invalid format
                </span>
              )}
              {validUrls.length > MAX_BATCH_LIMIT && (
                <span className="text-rose-500 font-bold">
                  ⚠️ Exceeds {MAX_BATCH_LIMIT} URL limit
                </span>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={handleAnalyzeAll}
              disabled={validUrls.length === 0 || validUrls.length > MAX_BATCH_LIMIT || isAnalyzing}
              className="font-bold shadow-lg shadow-blue-500/25"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing Batch...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Analyze All ({validUrls.length})
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Batch Results Card */}
        {batchResults.length > 0 && (
          <Card className="p-6 sm:p-7 space-y-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Analysis Results ({batchResults.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select the items you wish to add to your download queue
                </p>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={handleAddSelectedToQueue}
                disabled={selectedUrls.size === 0}
                className="font-bold shadow-md shadow-blue-500/20"
              >
                <ListOrdered className="w-4 h-4 mr-1.5" />
                Add ({selectedUrls.size}) to Queue
              </Button>
            </div>

            <div className="space-y-2.5">
              {batchResults.map((item) => {
                const isReady = item.status === 'ready';
                const isSelected = selectedUrls.has(item.url);

                return (
                  <div
                    key={item.url}
                    onClick={() => isReady && toggleSelectUrl(item.url)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      !isReady
                        ? 'opacity-60 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/40 cursor-pointer shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-blue-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                      {isReady && (
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge size="sm" variant={isReady ? 'success' : 'error'}>
                            {isReady ? <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> : <AlertCircle className="w-2.5 h-2.5 mr-1" />}
                            {isReady ? 'Ready' : 'Failed'}
                          </Badge>
                          {item.metadata?.platform && (
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {item.metadata.platform}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.metadata?.title || item.url}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    {item.error && (
                      <span className="text-[11px] text-rose-500 shrink-0 font-medium">
                        {item.error}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}

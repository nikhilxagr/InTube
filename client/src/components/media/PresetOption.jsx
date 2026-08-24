import { Check } from 'lucide-react';

export function PresetOption({ preset, isSelected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(preset.key)}
      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
        isSelected
          ? 'bg-blue-500/15 border border-blue-500/50 text-blue-900 dark:text-blue-200'
          : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-blue-400/40'
      }`}
    >
      <div className="min-w-0 pr-2">
        <div className="font-bold text-xs flex items-center gap-1.5">
          <span>{preset.label}</span>
          {preset.key === 'smart' && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              Auto
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {preset.description}
        </div>
      </div>

      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
          isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600'
        }`}
      >
        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
      </div>
    </button>
  );
}

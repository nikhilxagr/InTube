import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PRESET_DEFINITIONS, PresetResolver } from './PresetResolver.js';
import { PresetOption } from './PresetOption.jsx';

export function PresetSelector({ selectedPreset, onSelectPreset }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeDef = PRESET_DEFINITIONS.find((p) => p.key === selectedPreset) || PRESET_DEFINITIONS[0];

  const handleSelect = (key) => {
    PresetResolver.savePreset(key);
    onSelectPreset(key);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
          <span>Download Preset</span>
        </label>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100 transition-colors"
        >
          <span>{activeDef.label}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-2 animate-fadeIn">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
            Presets automatically map to authentic resolutions from the provider. You can still manually choose any format below.
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {PRESET_DEFINITIONS.map((preset) => (
              <PresetOption
                key={preset.key}
                preset={preset}
                isSelected={selectedPreset === preset.key}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Layers } from 'lucide-react';
import { MAP_LAYERS } from '@/config/mapOptions';

function LayerToggleButton({ layer, isActive, onToggleLayer }) {
  return (
    <button
      type="button"
      onClick={() => onToggleLayer(layer.id)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
        isActive
          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200'
          : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
      }`}
      aria-pressed={isActive}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: isActive ? layer.color : '#64748b' }}
      />
      {layer.label}
    </button>
  );
}

export default function MapLayerControls({ activeLayers, onToggleLayer, className = '' }) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div
      className={`absolute z-[1000] top-3 left-3 flex max-w-[min(100%,13.5rem)] flex-col gap-2 pointer-events-none ${className}`.trim()}
    >
      <button
        type="button"
        onClick={() => setMobileExpanded((prev) => !prev)}
        className="pointer-events-auto inline-flex md:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-slate-950/90 border-slate-700/80 text-slate-200 shadow-lg backdrop-blur-sm"
        aria-expanded={mobileExpanded}
        aria-controls="map-layer-controls-panel"
      >
        <Layers className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
        Map Layers
      </button>

      <div
        id="map-layer-controls-panel"
        className={`pointer-events-auto flex flex-col items-start gap-1.5 rounded-xl border border-slate-700/80 bg-slate-950/85 p-2 shadow-lg backdrop-blur-sm ${
          mobileExpanded ? 'flex' : 'hidden md:flex'
        }`}
      >
        {MAP_LAYERS.map((layer) => (
          <LayerToggleButton
            key={layer.id}
            layer={layer}
            isActive={Boolean(activeLayers[layer.id])}
            onToggleLayer={onToggleLayer}
          />
        ))}
      </div>
    </div>
  );
}

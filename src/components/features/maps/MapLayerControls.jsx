import { MAP_LAYERS } from '@/config/mapOptions';

export default function MapLayerControls({ activeLayers, onToggleLayer }) {
  return (
    <div className="bg-slate-950/90 backdrop-blur-sm border border-slate-700/80 rounded-xl p-3 shadow-lg">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        Map Layers
      </p>
      <div className="flex flex-wrap gap-2">
        {MAP_LAYERS.map((layer) => {
          const isActive = Boolean(activeLayers[layer.id]);

          return (
            <button
              key={layer.id}
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
        })}
      </div>
    </div>
  );
}

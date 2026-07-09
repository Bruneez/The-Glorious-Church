function ContentTypePlaceholder({ label, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 p-4">
      <p className="text-xs font-semibold text-white">{label}</p>
      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{description}</p>
      <p className="text-[10px] uppercase tracking-wider text-indigo-400/80 mt-2 font-semibold">
        Coming soon
      </p>
    </div>
  );
}

export default function BlueprintSection({ section }) {
  if (!section) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-5 md:p-6">
        <p className="text-sm text-slate-400">
          Select a section above to browse The Glorious Church reference library.
        </p>
      </div>
    );
  }

  const paragraphs = section.paragraphs || [];
  const plannedContent = section.plannedContent || [];

  return (
    <article className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-5 md:p-6 space-y-5">
      <header>
        <h2 className="text-lg font-bold text-white tracking-wide">{section.title}</h2>
        {section.subtitle ? (
          <p className="text-sm text-indigo-400/90 mt-1.5 leading-relaxed">{section.subtitle}</p>
        ) : null}
      </header>

      {paragraphs.length > 0 ? (
        <div className="space-y-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm text-slate-400 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {section.contentBlocks?.length > 0 ? (
        <div className="space-y-3">
          {section.contentBlocks.map((block) => (
            <div
              key={block.id || `${block.type}-${block.title}`}
              className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4"
            >
              <p className="text-xs font-semibold text-white">{block.title || block.type}</p>
              <p className="text-[11px] text-slate-500 mt-1">Content block renderer pending.</p>
            </div>
          ))}
        </div>
      ) : null}

      {plannedContent.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Planned content areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plannedContent.map((item) => (
              <ContentTypePlaceholder
                key={item.type}
                label={item.label}
                description={item.description}
              />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function PopupDetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-[11px] text-slate-200 leading-snug">{value}</span>
    </div>
  );
}

function PopupShell({ children, action }) {
  return (
    <div className="min-w-[220px] max-w-[260px] space-y-3">
      {children}
      {action}
    </div>
  );
}

function PopupActionButton({ href, label, disabled = false }) {
  if (disabled || !href) {
    return (
      <button
        type="button"
        disabled
        className="w-full text-center text-[11px] font-semibold py-2 px-3 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
      >
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      className="block w-full text-center text-[11px] font-semibold py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
    >
      {label}
    </a>
  );
}

export function MapMemberPopup({ data }) {
  return (
    <PopupShell
      action={
        <PopupActionButton href={data.profilePath || '/members'} label="View Member" />
      }
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-indigo-600 border border-indigo-400/30 overflow-hidden flex items-center justify-center font-bold uppercase text-white shrink-0 text-xs">
          {data.photo ? (
            <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            data.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'M'
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{data.name}</p>
          <p className="text-[10px] text-indigo-400 font-medium mt-0.5">Member</p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-700/60">
        <PopupDetailRow label="Phone" value={data.phone} />
        <PopupDetailRow label="Home Address" value={data.address} />
        <PopupDetailRow label="Branch" value={data.branch} />
        <PopupDetailRow label="Cell Leader" value={data.cellLeader} />
        <PopupDetailRow label="Occupation" value={data.occupation} />
      </div>
    </PopupShell>
  );
}

export function MapMemberWorkPopup({ data }) {
  return (
    <PopupShell
      action={
        <PopupActionButton href={data.profilePath || '/members'} label="View Profile" />
      }
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-amber-600 border border-amber-400/30 overflow-hidden flex items-center justify-center font-bold uppercase text-white shrink-0 text-xs">
          {data.photo ? (
            <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            'W'
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{data.name}</p>
          <p className="text-[10px] text-amber-400 font-medium mt-0.5">Work Location</p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-700/60">
        <PopupDetailRow label="Company" value={data.companyName} />
        <PopupDetailRow label="Position" value={data.position} />
        <PopupDetailRow label="Work Address" value={data.address} />
        <PopupDetailRow label="Phone" value={data.phone} />
        <PopupDetailRow label="Branch" value={data.branch} />
      </div>
    </PopupShell>
  );
}

export function MapSchoolPopup({ data }) {
  return (
    <PopupShell
      action={<PopupActionButton href={data.schoolPath || '/schools'} label="View School" />}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-sky-600 border border-sky-400/30 overflow-hidden flex items-center justify-center font-bold uppercase text-white shrink-0 text-xs">
          {data.logo ? (
            <img src={data.logo} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            data.name?.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{data.name}</p>
          <p className="text-[10px] text-sky-400 font-medium mt-0.5">{data.schoolType}</p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-700/60">
        <PopupDetailRow
          label="Church Members Attending"
          value={String(data.memberCount ?? 0)}
        />
      </div>
    </PopupShell>
  );
}

export function MapBranchPopup({ data }) {
  return (
    <PopupShell
      action={
        <PopupActionButton
          href={data.branchPath}
          label="View Branch"
          disabled={!data.branchPath}
        />
      }
    >
      <div>
        <p className="text-sm font-bold text-white">{data.name}</p>
        <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Branch</p>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-700/60">
        <PopupDetailRow label="Branch Pastor" value={data.pastor} />
        <PopupDetailRow label="Members" value={String(data.memberCount ?? 0)} />
      </div>
    </PopupShell>
  );
}

export function MapMinistryPopup({ data }) {
  return (
    <PopupShell
      action={
        <PopupActionButton
          href={data.ministryPath}
          label="View Ministry"
          disabled={!data.ministryPath}
        />
      }
    >
      <div>
        <p className="text-sm font-bold text-white">{data.name}</p>
        <p className="text-[10px] text-amber-400 font-medium mt-0.5">Ministry</p>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-700/60">
        <PopupDetailRow label="Leader" value={data.leader} />
        <PopupDetailRow label="Members" value={String(data.memberCount ?? 0)} />
      </div>
    </PopupShell>
  );
}

export function MapCreativeArtsPopup({ data }) {
  return (
    <PopupShell
      action={
        <PopupActionButton
          href={data.departmentPath || '/creative-arts'}
          label="View Department"
        />
      }
    >
      <div>
        <p className="text-sm font-bold text-white">{data.name}</p>
        <p className="text-[10px] text-pink-400 font-medium mt-0.5">Creative Arts</p>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-700/60">
        <PopupDetailRow label="Leader" value={data.leader} />
        <PopupDetailRow label="Members" value={String(data.memberCount ?? 0)} />
      </div>
    </PopupShell>
  );
}

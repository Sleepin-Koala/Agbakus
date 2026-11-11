export function SectionGroup({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-[#2a2c33] bg-amber-900 p-3 text-amber-100">
      <div className="mb-2 flex items-center justify-between border-b border-[#202227] pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">{title}</span>
        {badge ? <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">{badge}</span> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
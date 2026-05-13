export default function NoticesLoading() {
  return (
    <div className="min-h-screen bg-brand-slate-100">
      <div className="bg-white border-b border-ink-200 h-16" />

      <div className="container-content py-10 animate-pulse">
        {/* breadcrumb */}
        <div className="mb-6 h-4 w-24 bg-ink-200/50 rounded" />

        {/* title + button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-32 bg-ink-200/60 rounded-lg" />
          <div className="h-9 w-28 bg-ink-200/40 rounded-lg" />
        </div>

        {/* filter bar */}
        <div className="mb-6 flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-ink-200/40" style={{ width: `${80 + i * 24}px` }} />
          ))}
        </div>

        {/* notice cards */}
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-ink-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="h-3.5 w-24 bg-ink-200/50 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-ink-200/60 rounded mb-3" />
                  <div className="flex gap-4">
                    <div className="h-3.5 w-20 bg-ink-200/40 rounded" />
                    <div className="h-3.5 w-16 bg-ink-200/40 rounded" />
                    <div className="h-3.5 w-24 bg-ink-200/40 rounded" />
                  </div>
                </div>
                <div className="h-6 w-12 bg-ink-200/50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

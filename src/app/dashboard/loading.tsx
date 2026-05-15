export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-brand-slate-100">
      {/* Header skeleton */}
      <div className="bg-white border-b border-ink-200 h-16" />

      <div className="container-content py-12 animate-pulse">
        {/* Banner skeleton */}
        <div className="mb-6 h-14 bg-ink-200/60 rounded-xl" />

        {/* Title */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-ink-200/60 rounded-lg mb-2" />
          <div className="h-5 w-48 bg-ink-200/40 rounded" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card-md">
              <div className="h-4 w-20 bg-ink-200/60 rounded mb-3" />
              <div className="h-9 w-16 bg-ink-200/60 rounded" />
            </div>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid gap-4 tablet:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-ink-200/60" />
                <div className="h-4 w-16 bg-ink-200/40 rounded" />
              </div>
              <div className="h-5 w-24 bg-ink-200/60 rounded mb-2" />
              <div className="h-4 w-16 bg-ink-200/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

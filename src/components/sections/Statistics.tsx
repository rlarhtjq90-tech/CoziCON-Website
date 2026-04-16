const STATS = [
  { value: '2,400+', unit: '건', label: '등록 공사 프로젝트' },
  { value: '1,800+', unit: '개', label: '가입 전문건설사' },
  { value: '98%',    unit: '',   label: '낙찰 후 계약 완료율' },
  { value: '14일',   unit: '',   label: '평균 낙찰 소요 기간' },
]

export default function Statistics() {
  return (
    <section className="bg-gradient-stats section-py">
      <div className="container-content">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-p14 font-semibold text-primary-300 tracking-widest uppercase">
            BIDBILDING IN NUMBERS
          </span>
          <h2 className="text-t3 laptop:text-t2 font-bold text-white">
            건설 입찰, 숫자로 증명합니다
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 laptop:grid-cols-4 mt-12 rounded-2xl overflow-hidden border border-white/10">
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center px-6 py-8
                ${idx % 2 === 0 && idx < 2 ? 'border-r border-white/10' : ''}
                ${idx < 2 ? 'border-b laptop:border-b-0' : ''}
                ${idx === 1 || idx === 3 ? '' : ''}
                laptop:border-r laptop:last:border-r-0 border-white/10`}
            >
              <div className="flex items-end gap-1 mb-2">
                <span
                  className="text-t1 font-black text-white"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-t5 font-bold text-primary-300 mb-1">{stat.unit}</span>
                )}
              </div>
              <p className="text-p14 text-primary-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

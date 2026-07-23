export default function KeywordScanner({ keywords }) {
  if (!keywords || keywords.length === 0) return null

  const present = keywords.filter((k) => k.present)
  const missing = keywords.filter((k) => !k.present)
  const score = Math.round((present.length / keywords.length) * 100)

  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">ATS Keyword Scanner</h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          score >= 75 ? 'bg-green-900 text-green-300' : score >= 50 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
        }`}>
          {present.length}/{keywords.length} keywords
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {missing.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Missing from Resume</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((k) => (
              <span key={k.keyword} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full border border-red-800">
                {k.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {present.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Found in Resume</p>
          <div className="flex flex-wrap gap-2">
            {present.map((k) => (
              <span key={k.keyword} className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full border border-green-800">
                {k.keyword} {k.frequency > 1 && <span className="opacity-60">×{k.frequency}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

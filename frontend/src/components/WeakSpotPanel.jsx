import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

export default function WeakSpotPanel({ result }) {
  const sections = [
    { key: 'skills', label: 'Skills', data: result.skills },
    { key: 'experience', label: 'Experience', data: result.experience },
    { key: 'education', label: 'Education', data: result.education },
  ]

  const sorted = [...sections].sort((a, b) => a.data.score - b.data.score)
  const weakest = sorted[0]
  const strongest = sorted[sorted.length - 1]

  const scoreColor = (s) =>
    s >= 75 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400'

  const badgeBg = (s) =>
    s >= 75
      ? 'bg-green-900/30 border-green-700 text-green-300'
      : s >= 50
      ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
      : 'bg-red-900/30 border-red-700 text-red-300'

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-5">
      <h3 className="font-bold text-lg">Resume Insights</h3>

      {/* Strength bar for all 3 sections */}
      <div className="space-y-3">
        {sorted.map(({ label, data }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{label}</span>
              <span className={`font-semibold ${scoreColor(data.score)}`}>{data.score}/100</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  data.score >= 75 ? 'bg-green-500' : data.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Weakest section callout */}
      <div className={`rounded-xl border p-4 space-y-2 ${badgeBg(weakest.data.score)}`}>
        <div className="flex items-center gap-2 font-semibold text-sm">
          <AlertTriangle size={14} />
          Weakest Area: {weakest.label} ({weakest.data.score}/100)
        </div>
        {weakest.data.missing.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Missing from your resume:</p>
            <div className="flex flex-wrap gap-1.5">
              {weakest.data.missing.map((m) => (
                <span key={m} className="text-xs bg-black/30 border border-current/30 px-2 py-0.5 rounded-full">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
        {weakest.data.suggestions.length > 0 && (
          <p className="text-xs leading-relaxed">{weakest.data.suggestions[0]}</p>
        )}
      </div>

      {/* Strongest section callout */}
      <div className="rounded-xl border border-green-800 bg-green-900/20 p-4 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-sm text-green-300">
          <CheckCircle size={14} />
          Strongest Area: {strongest.label} ({strongest.data.score}/100)
        </div>
        {strongest.data.matched.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Matched keywords:</p>
            <div className="flex flex-wrap gap-1.5">
              {strongest.data.matched.slice(0, 8).map((m) => (
                <span key={m} className="text-xs bg-green-900/40 border border-green-700 text-green-300 px-2 py-0.5 rounded-full">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick tip */}
      <div className="flex items-start gap-3 bg-purple-950/30 border border-purple-800 rounded-xl p-4">
        <TrendingUp size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <p className="text-xs text-purple-200 leading-relaxed">
          Use the <span className="font-semibold">Resume Rewriter</span> below to rewrite weak bullets targeting the missing {weakest.label.toLowerCase()} keywords — then hit <span className="font-semibold">Re-analyze</span> to see your score improve.
        </p>
      </div>
    </div>
  )
}

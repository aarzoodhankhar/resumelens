import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

export default function SectionCard({ title, section }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            section.score >= 75
              ? 'bg-green-900 text-green-300'
              : section.score >= 50
              ? 'bg-yellow-900 text-yellow-300'
              : 'bg-red-900 text-red-300'
          }`}
        >
          {section.score}/100
        </span>
      </div>

      {section.matched.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Matched</p>
          <div className="flex flex-wrap gap-2">
            {section.matched.map((m) => (
              <span key={m} className="flex items-center gap-1 text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                <CheckCircle size={12} /> {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {section.missing.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Missing</p>
          <div className="flex flex-wrap gap-2">
            {section.missing.map((m) => (
              <span key={m} className="flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full">
                <XCircle size={12} /> {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {section.suggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Suggestions</p>
          <ul className="space-y-1">
            {section.suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-yellow-200">
                <Lightbulb size={12} className="mt-0.5 shrink-0 text-yellow-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

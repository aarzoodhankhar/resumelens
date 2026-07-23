export default function AnalyzingOverlay({ llm }) {
  return (
    <div className="mt-8 space-y-4 animate-pulse">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-32 bg-gray-700 rounded" />
          <div className="h-4 w-24 bg-gray-700 rounded" />
        </div>
        {/* Score circles skeleton */}
        <div className="flex justify-around mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gray-700" />
              <div className="h-3 w-16 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        {/* Summary skeleton */}
        <div className="space-y-2 bg-gray-900 rounded-lg p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-3 bg-gray-700 rounded ${i === 2 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-gray-700 rounded" />
              <div className="h-5 w-12 bg-gray-700 rounded-full" />
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-3 bg-gray-700 rounded" style={{ width: `${70 + j * 8}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        Analyzing with {llm}...
      </p>
    </div>
  )
}

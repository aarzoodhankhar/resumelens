export default function ScoreCircle({ score, label }) {
  const color =
    score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
  const ring =
    score >= 75 ? 'border-green-500' : score >= 50 ? 'border-yellow-500' : 'border-red-500'

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-20 h-20 rounded-full border-4 ${ring} flex items-center justify-center`}
      >
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  )
}

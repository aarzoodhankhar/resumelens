import { useEffect, useState } from 'react'

export default function ScoreCircle({ score, label }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    setDisplayed(0)
    let start = null
    const duration = 800
    function step(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const color =
    score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'

  // SVG arc progress ring
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayed / 100) * circumference
  const strokeColor =
    score >= 75 ? '#4ade80' : score >= 50 ? '#facc15' : '#f87171'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#374151" strokeWidth="6" />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{displayed}</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  )
}

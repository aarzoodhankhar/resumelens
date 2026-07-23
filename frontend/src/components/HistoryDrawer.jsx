import { useState, useEffect } from 'react'
import axios from 'axios'
import { History, Trash2, X, ChevronRight } from 'lucide-react'

export default function HistoryDrawer({ onLoad }) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState([])

  async function fetchHistory() {
    try {
      const res = await axios.get('/v1/history')
      setEntries(res.data)
    } catch {}
  }

  useEffect(() => {
    if (open) fetchHistory()
  }, [open])

  async function handleDelete(id, e) {
    e.stopPropagation()
    await axios.delete(`/v1/history/${id}`)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleLoad(id) {
    const res = await axios.get(`/v1/history/${id}`)
    onLoad(res.data)
    setOpen(false)
  }

  const color = (score) =>
    score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <History size={16} />
        History
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Match History</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="text-gray-500 text-sm p-5">No history yet. Run your first analysis!</p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {entries.map((e) => (
                  <li
                    key={e.id}
                    onClick={() => handleLoad(e.id)}
                    className="p-4 hover:bg-gray-800 cursor-pointer flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{e.job_title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.created_at}</p>
                      <div className="flex gap-3 mt-1 text-xs">
                        <span className={color(e.overall_score)}>Overall {e.overall_score}</span>
                        <span className={color(e.skills_score)}>Skills {e.skills_score}</span>
                        <span className={color(e.experience_score)}>Exp {e.experience_score}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(ev) => handleDelete(e.id, ev)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={14} className="text-gray-600" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}

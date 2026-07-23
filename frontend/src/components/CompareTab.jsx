import { useState } from 'react'
import axios from 'axios'
import { Plus, Trash2, Trophy, Zap } from 'lucide-react'

const EMPTY_JD = { title: '', jd: '' }

export default function CompareTab({ resume }) {
  const [jobs, setJobs] = useState([{ ...EMPTY_JD }, { ...EMPTY_JD }])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateJob(i, field, val) {
    setJobs((prev) => prev.map((j, idx) => (idx === i ? { ...j, [field]: val } : j)))
  }

  function addJob() {
    if (jobs.length < 3) setJobs((prev) => [...prev, { ...EMPTY_JD }])
  }

  function removeJob(i) {
    if (jobs.length > 2) setJobs((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleCompare() {
    if (!resume) return setError('Upload a resume first.')
    if (jobs.some((j) => !j.title.trim() || !j.jd.trim())) return setError('Fill in all job titles and descriptions.')
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const form = new FormData()
      form.append('resume', resume)
      form.append('job_descriptions', JSON.stringify(jobs))
      form.append('use_openai', false)
      const res = await axios.post('/v1/compare', form)
      setResults(res.data)
    } catch (e) {
      const detail = e.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Compare failed.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s) => s >= 75 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400'
  const scoreBg = (s) => s >= 75 ? 'bg-green-900/40 border-green-700' : s >= 50 ? 'bg-yellow-900/40 border-yellow-700' : 'bg-red-900/40 border-red-700'

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Job {i + 1}</span>
              {jobs.length > 2 && (
                <button onClick={() => removeJob(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <input
              value={job.title}
              onChange={(e) => updateJob(i, 'title', e.target.value)}
              placeholder="Job title (e.g. SWE Intern @ Google)"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <textarea
              value={job.jd}
              onChange={(e) => updateJob(i, 'jd', e.target.value)}
              placeholder="Paste job description..."
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {jobs.length < 3 && (
          <button
            onClick={addJob}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 border border-purple-800 hover:border-purple-600 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add 3rd Job
          </button>
        )}
        <button
          onClick={handleCompare}
          disabled={loading || !resume}
          className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {loading
            ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Comparing...</>
            : <><Zap size={14} /> Compare Jobs</>}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {results && (
        <div className="space-y-4">
          {/* Best fit banner */}
          <div className="flex items-center gap-3 bg-green-950/40 border border-green-700 rounded-xl p-4">
            <Trophy size={20} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Best Fit</p>
              <p className="text-white font-semibold">{results.best_fit}</p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Overall</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Skills</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Experience</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Education</th>
                </tr>
              </thead>
              <tbody>
                {results.comparisons.map((c, i) => (
                  <tr key={i} className={`border-b border-gray-700/50 ${i === 0 ? 'bg-green-950/20' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Trophy size={14} className="text-yellow-400" />}
                        <span className="text-white font-medium">{c.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-bold text-lg ${scoreColor(c.result.overall_score)}`}>{c.result.overall_score}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={scoreColor(c.result.skills.score)}>{c.result.skills.score}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={scoreColor(c.result.experience.score)}>{c.result.experience.score}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={scoreColor(c.result.education.score)}>{c.result.education.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary per job */}
          <div className="grid gap-4 md:grid-cols-2">
            {results.comparisons.map((c, i) => (
              <div key={i} className={`rounded-xl border p-4 space-y-2 ${scoreBg(c.result.overall_score)}`}>
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{c.result.summary}</p>
                {c.result.top_suggestions[0] && (
                  <p className="text-xs text-yellow-300">💡 {c.result.top_suggestions[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

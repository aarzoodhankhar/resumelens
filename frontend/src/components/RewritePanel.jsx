import { useState } from 'react'
import axios from 'axios'
import { Wand2, Copy, Check, RefreshCw, TrendingUp } from 'lucide-react'

export default function RewritePanel({ jd, resumeText, originalScore, onReanalyzed }) {
  const [bullet, setBullet] = useState('')
  const [rewrites, setRewrites] = useState([]) // accumulated rewritten bullets
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [copied, setCopied] = useState(null)
  const [scoreDelta, setScoreDelta] = useState(null)

  async function handleRewrite() {
    if (!bullet.trim() || !jd) return
    setLoading(true)
    setCurrent(null)
    try {
      const form = new FormData()
      form.append('bullet', bullet)
      form.append('job_description', jd)
      form.append('use_openai', false)
      const res = await axios.post('/v1/rewrite', form)
      setCurrent(res.data)
    } catch (e) {
      setCurrent({ error: e.response?.data?.detail || 'Rewrite failed' })
    } finally {
      setLoading(false)
    }
  }

  function acceptRewrite() {
    if (!current?.rewritten) return
    setRewrites((prev) => [...prev, current.rewritten])
    setBullet('')
    setCurrent(null)
  }

  async function handleReanalyze() {
    if (!resumeText || rewrites.length === 0) return
    setReanalyzing(true)
    setScoreDelta(null)
    try {
      const res = await axios.post('/v1/reanalyze', {
        resume_text: resumeText,
        job_description: jd,
        rewrites,
        use_openai: false,
      })
      const after = res.data.result.overall_score
      const delta = after - originalScore
      setScoreDelta({ before: originalScore, after, delta })
      onReanalyzed(res.data.result)
    } catch (e) {
      console.error(e)
    } finally {
      setReanalyzing(false)
    }
  }

  function copy(text, idx) {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Wand2 size={18} className="text-purple-400" />
        Resume Bullet Rewriter
      </h3>
      <p className="text-xs text-gray-400">
        Paste a bullet from your resume → rewrite it → accept to queue → re-analyze to see score change.
      </p>

      <textarea
        value={bullet}
        onChange={(e) => setBullet(e.target.value)}
        placeholder="Paste a bullet point from your resume..."
        rows={3}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
      />

      <button
        onClick={handleRewrite}
        disabled={!bullet.trim() || !jd || loading}
        className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading
          ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rewriting...</>
          : <><Wand2 size={14} /> Rewrite for this JD</>}
      </button>

      {current && !current.error && (
        <div className="space-y-3">
          <div className="bg-gray-900 rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Original</p>
            <p className="text-sm text-gray-400 line-through">{current.original}</p>
          </div>
          <div className="bg-purple-950/40 border border-purple-800 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">Rewritten</p>
                <p className="text-sm text-white">{current.rewritten}</p>
              </div>
              <button onClick={() => copy(current.rewritten, 'cur')} className="shrink-0 text-gray-400 hover:text-white mt-1">
                {copied === 'cur' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-purple-300 italic">{current.explanation}</p>
            <button
              onClick={acceptRewrite}
              className="mt-1 text-xs bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded-full text-white transition-colors"
            >
              + Accept &amp; queue for re-analysis
            </button>
          </div>
        </div>
      )}

      {current?.error && <p className="text-sm text-red-400">{current.error}</p>}

      {/* Queued rewrites */}
      {rewrites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{rewrites.length} bullet{rewrites.length > 1 ? 's' : ''} queued</p>
          {rewrites.map((r, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-900 rounded-lg p-2">
              <span className="text-xs text-green-400 shrink-0 mt-0.5">✓</span>
              <p className="text-xs text-gray-300 flex-1">{r}</p>
              <button onClick={() => copy(r, i)} className="text-gray-500 hover:text-white shrink-0">
                {copied === i ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              </button>
            </div>
          ))}

          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {reanalyzing
              ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Re-analyzing...</>
              : <><RefreshCw size={14} /> Re-analyze with rewritten bullets</>}
          </button>
        </div>
      )}

      {/* Score delta */}
      {scoreDelta && (
        <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${
          scoreDelta.delta > 0 ? 'bg-green-950/40 border-green-700' : scoreDelta.delta < 0 ? 'bg-red-950/40 border-red-700' : 'bg-gray-900 border-gray-700'
        }`}>
          <TrendingUp size={18} className={scoreDelta.delta > 0 ? 'text-green-400' : 'text-gray-400'} />
          <span className="text-2xl font-bold text-white">{scoreDelta.before}</span>
          <span className="text-gray-400">→</span>
          <span className="text-2xl font-bold text-white">{scoreDelta.after}</span>
          <span className={`text-lg font-bold ${scoreDelta.delta > 0 ? 'text-green-400' : scoreDelta.delta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            ({scoreDelta.delta > 0 ? '+' : ''}{scoreDelta.delta})
          </span>
        </div>
      )}
    </div>
  )
}

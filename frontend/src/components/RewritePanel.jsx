import { useState } from 'react'
import axios from 'axios'
import { Wand2, Copy, Check } from 'lucide-react'

export default function RewritePanel({ jd }) {
  const [bullet, setBullet] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleRewrite() {
    if (!bullet.trim() || !jd) return
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('bullet', bullet)
      form.append('job_description', jd)
      form.append('use_openai', false)
      const res = await axios.post('/v1/rewrite', form)
      setResult(res.data)
    } catch (e) {
      setResult({ error: e.response?.data?.detail || 'Rewrite failed' })
    } finally {
      setLoading(false)
    }
  }

  function copy(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Wand2 size={18} className="text-purple-400" />
        Resume Bullet Rewriter
      </h3>
      <p className="text-xs text-gray-400">Paste any bullet from your resume — the AI rewrites it to match the JD language.</p>

      <textarea
        value={bullet}
        onChange={(e) => setBullet(e.target.value)}
        placeholder="e.g. Worked with Kubernetes on SAP BTP cloud-native infrastructure..."
        rows={3}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
      />

      <button
        onClick={handleRewrite}
        disabled={!bullet.trim() || !jd || loading}
        className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rewriting...</>
        ) : (
          <><Wand2 size={14} /> Rewrite for this JD</>
        )}
      </button>

      {result && !result.error && (
        <div className="space-y-3">
          <div className="bg-gray-900 rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Original</p>
            <p className="text-sm text-gray-400 line-through">{result.original}</p>
          </div>
          <div className="bg-purple-950/40 border border-purple-800 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">Rewritten</p>
                <p className="text-sm text-white">{result.rewritten}</p>
              </div>
              <button onClick={() => copy(result.rewritten)} className="shrink-0 text-gray-400 hover:text-white transition-colors mt-1">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-purple-300 italic">{result.explanation}</p>
          </div>
        </div>
      )}

      {result?.error && (
        <p className="text-sm text-red-400">{result.error}</p>
      )}
    </div>
  )
}

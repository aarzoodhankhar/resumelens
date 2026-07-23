import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Zap, Clock, Link, Loader } from 'lucide-react'
import { matchResume, extractResumeText, fetchJdFromUrl } from '../services/api'
import ScoreCircle from '../components/ScoreCircle'
import SectionCard from '../components/SectionCard'
import KeywordScanner from '../components/KeywordScanner'
import RewritePanel from '../components/RewritePanel'
import HistoryDrawer from '../components/HistoryDrawer'
import CompareTab from '../components/CompareTab'
import WeakSpotPanel from '../components/WeakSpotPanel'
import AnalyzingOverlay from '../components/AnalyzingOverlay'

export default function Home() {
  const [tab, setTab] = useState('analyze')
  const [resume, setResume] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jd, setJd] = useState('')
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [result, setResult] = useState(null)
  const [originalScore, setOriginalScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // URL fetch state
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [jdUrl, setJdUrl] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [fetchUrlError, setFetchUrlError] = useState('')

  const onDrop = useCallback(async (files) => {
    if (files[0]) {
      setResume(files[0])
      try {
        const text = await extractResumeText(files[0])
        setResumeText(text)
      } catch {}
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  async function handleFetchUrl() {
    if (!jdUrl.trim()) return
    setFetchingUrl(true)
    setFetchUrlError('')
    try {
      const text = await fetchJdFromUrl(jdUrl.trim())
      setJd(text)
      setShowUrlInput(false)
      setJdUrl('')
    } catch (err) {
      const detail = err.response?.data?.detail
      setFetchUrlError(detail || 'Could not fetch that URL. Try pasting the JD manually.')
    } finally {
      setFetchingUrl(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!resume || !jd.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await matchResume(resume, jd, useOpenAI)
      setResult(data)
      setOriginalScore(data.overall_score)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(', ')
        : detail || err.message || 'Something went wrong. Is the backend running?'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleHistoryLoad(entry) {
    setTab('analyze')
    setResult(entry)
    setOriginalScore(entry.overall_score)
    window.scrollTo({ top: document.getElementById('results')?.offsetTop, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">ResumeLens</h1>
            <p className="text-gray-400">AI-powered match analysis — powered by Groq (Llama 3.3 70B)</p>
          </div>
          <HistoryDrawer onLoad={handleHistoryLoad} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-800 p-1 rounded-xl mb-8 w-fit">
          {[{ id: 'analyze', label: 'Analyze' }, { id: 'compare', label: 'Compare Jobs' }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Resume drop zone — shared */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive ? 'border-purple-500 bg-purple-950/30' : 'border-gray-700 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          {resume ? (
            <div className="flex items-center justify-center gap-3 text-green-400">
              <FileText size={24} />
              <span className="font-medium">{resume.name}</span>
              {resumeText && <span className="text-xs text-gray-500">({resumeText.length} chars extracted)</span>}
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={32} className="mx-auto text-gray-500" />
              <p className="text-gray-400">Drop your resume PDF here or click to browse</p>
            </div>
          )}
        </div>

        {/* Analyze Tab */}
        {tab === 'analyze' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Job Description</label>
                <button
                  type="button"
                  onClick={() => { setShowUrlInput((v) => !v); setFetchUrlError('') }}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Link size={12} />
                  {showUrlInput ? 'Cancel' : 'Fetch from URL'}
                </button>
              </div>

              {showUrlInput && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleFetchUrl())}
                    placeholder="https://jobs.example.com/software-engineer"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={fetchingUrl || !jdUrl.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {fetchingUrl ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                    {fetchingUrl ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
              )}
              {fetchUrlError && <p className="text-xs text-red-400">{fetchUrlError}</p>}

              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here, or fetch it from a URL above..."
                rows={8}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="openai"
                checked={useOpenAI}
                onChange={(e) => setUseOpenAI(e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <label htmlFor="openai" className="text-sm text-gray-400">
                Use OpenAI instead of Groq (requires OPENAI_API_KEY in .env)
              </label>
            </div>
            <button
              type="submit"
              disabled={!resume || !jd.trim() || loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing with {useOpenAI ? 'OpenAI' : 'Groq'}...
                </>
              ) : (
                <><Zap size={18} /> Analyze Match</>
              )}
            </button>
          </form>
        )}

        {/* Compare Tab */}
        {tab === 'compare' && <CompareTab resume={resume} />}

        {error && (
          <div className="mt-6 p-4 bg-red-950 border border-red-700 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {tab === 'analyze' && loading && <AnalyzingOverlay llm={useOpenAI ? 'OpenAI' : 'Groq'} />}

        {/* Results — only for analyze tab */}
        {tab === 'analyze' && result && (
          <div id="results" className="mt-10 space-y-6">

            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Match Results</h2>
                {result.latency_ms && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    {result.latency_ms}ms via {result.llm_used}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-around gap-4 mb-6">
                <ScoreCircle score={result.overall_score} label="Overall" />
                <ScoreCircle score={result.skills.score} label="Skills" />
                <ScoreCircle score={result.experience.score} label="Experience" />
                <ScoreCircle score={result.education.score} label="Education" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed bg-gray-900 rounded-lg p-4">
                {result.summary}
              </p>
            </div>

            {result.top_suggestions?.length > 0 && (
              <div className="bg-yellow-950/40 border border-yellow-800 rounded-xl p-5">
                <h3 className="font-semibold text-yellow-300 mb-3">Top Actions to Improve Your Match</h3>
                <ol className="space-y-2">
                  {result.top_suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-yellow-100">
                      <span className="font-bold text-yellow-400 shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {result.keywords?.length > 0 && <KeywordScanner keywords={result.keywords} />}

            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard title="Skills" section={result.skills} />
              <SectionCard title="Experience" section={result.experience} />
              <SectionCard title="Education" section={result.education} />
            </div>

            <WeakSpotPanel result={result} />

            <RewritePanel
              jd={jd}
              resumeText={resumeText}
              originalScore={originalScore}
              onReanalyzed={(newResult) => setResult(newResult)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

import axios from 'axios'

export async function matchResume(resumeFile, jobDescription, useOpenAI = false) {
  const form = new FormData()
  form.append('resume', resumeFile)
  form.append('job_description', jobDescription)
  form.append('use_openai', useOpenAI)

  const res = await axios.post('/v1/match', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

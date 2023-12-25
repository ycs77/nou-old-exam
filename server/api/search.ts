import exams from '@/data/exams.json'

export default defineEventHandler(event => {
  const query = getQuery(event)
  const keyword = query.q as string

  return exams.filter(exam =>
    exam.course.toLowerCase().includes(keyword.toLowerCase())
  )
})

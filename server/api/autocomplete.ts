import courses from '@/data/courses.json'

export default defineEventHandler(event => {
  const query = getQuery(event)
  const keyword = query.q as string

  return courses.filter(course =>
    course.toLowerCase().includes(keyword.toLowerCase())
  )
})

import fs from 'node:fs'
import path from 'node:path'
import type { Exam } from './types'

function extractCources() {
  const exams: Exam[] = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), 'data/exams.json'),
      { encoding: 'utf-8' }
    )
  )

  const courses = new Set<string>()
  for (const exam of exams) {
    courses.add(exam.course)
  }

  fs.writeFileSync(
    path.resolve(process.cwd(), 'data/courses.json'),
    JSON.stringify([...courses], null, 2),
    { encoding: 'utf-8' }
  )
}

extractCources()

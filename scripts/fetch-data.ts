import fs from 'node:fs'
import path from 'node:path'
import { ofetch } from 'ofetch'
import { load } from 'cheerio'
import type { Exam, ExamType, SemesterItem } from './types'

const exams: Exam[] = []
const examSemesters: SemesterItem[] = []

async function loadExamSemesters() {
  // 國立空中大學 - 歷屆考題
  const $ = load(await ofetch('https://www.nou.edu.tw/fdcont.aspx?id=YIoy1wZdQ6M='))

  examSemesters.push(
    ...$('.clcont_cont a')
      .map(function () {
        return {
          title: $(this).text().trim(),
          link: $(this).attr('href')?.trim() ?? '',
        } satisfies SemesterItem
      })
      .get()
  )

  await Promise.all(
    examSemesters.map(examItem => {
      return loadExam(examItem)
    })
  )
}

async function loadExam(examItem: SemesterItem) {
  const $ = load(await ofetch(examItem.link))

  const nodes = $('body > table.size12nocolor > tbody')
    .contents()
    .get()

  let currentSemester: string | null = null
  let currentExamType: ExamType | null = null
  let currentDepartment: string | null = null
  let currentComment: string | null = null

  for (const node of nodes) {
    if ($(node).text().trim().match(/^[0-9]{3}年(上學期|下學期|暑期)$/)) {
      currentSemester = $(node).text().trim()
      // console.log(`semester: ${currentSemester}`)
    } else if (node.type === 'comment' && ['系所別', '課程內容'].includes(node.data.trim())) {
      currentComment = node.data
      // console.log(`comment: ${currentComment}`)
    } else if (currentComment === '系所別' && node.type === 'tag') {
      currentComment = null
      currentDepartment = $(node).text().trim()
        .replace(/^《/, '')
        .replace(/》$/, '')
      // console.log(`department: ${currentDepartment}`)
    } else if (currentComment === '課程內容' && node.type === 'tag') {
      currentComment = null

      const tables = $(node).find('> td > table.size12nocolor').get()

      tables.forEach(table => {
        currentExamType = $(table).find('> tbody > tr').eq(0).attr('bgcolor') === '#DEE7DE'
          ? 'midterm'
          : 'final'
        const trs = $(table).find('> tbody > tr').get()

        exams.push(
          ...trs
            .slice(1)
            .map(tr => ({
              course: $(tr).find('> td').eq(0).text().trim(),
              semester: currentSemester ?? '',
              examType: currentExamType ?? 'final',
              department: currentDepartment ?? '',
              first: $(tr).find('> td').eq(1).find('a').attr('href'),
              second: $(tr).find('> td').eq(2).find('a').attr('href'),
            } satisfies Exam))
        )
      })
    }
  }

  fs.writeFileSync(
    path.resolve(process.cwd(), 'data/exams.json'),
    JSON.stringify(exams, null, 2),
    { encoding: 'utf-8' }
  )
}

await loadExamSemesters()

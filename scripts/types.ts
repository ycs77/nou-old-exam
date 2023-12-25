export interface SemesterItem {
  title: string
  link: string
}

export type ExamType = 'midterm' | 'final'

export interface Exam {
  /** 科目 */
  course: string
  /** 學期 */
  semester: string
  /** 期中考 / 期末考 */
  examType: ExamType
  /** 學系 */
  department: string
  /** 正參連結 */
  first?: string
  /** 副參連結 */
  second?: string
}

export interface GroupedExam extends Exam {
  /** 學年排序 key */
  semesterKey: number
}

<template>
  <div class="container pt-8 pb-12">
    <h1 class="text-sky-900 text-3xl text-center font-bold">國立空中大學 考古題查詢</h1>

    <div class="mt-6">
      <form @submit.prevent="search()">
        <input
          v-model="keyword"
          type="text"
          class="form-input w-full px-4 border-gray-300 focus:border-sky-400 focus:ring-sky-400 rounded-md placeholder:text-gray-400"
          placeholder="請輸入科目名稱"
          list="searchAutocomplete"
          autocomplete="off"
          @input="autocomplete()"
          @focus="autocomplete()"
          @compositionstart="isCompositionTyping = true"
          @compositionend="isCompositionTyping = false"
        >
        <datalist id="searchAutocomplete">
          <option
            v-for="item in autocompleteList"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </datalist>
      </form>

      <ClientOnly>
        <div class="mt-1 flex items-center justify-end">
          <button
            v-if="exams.length"
            type="button"
            class="text-gray-400 hover:text-sky-500 hover:underline text-sm"
            @click="clear()"
          >
            × 清除搜尋結果
          </button>
        </div>
      </ClientOnly>
    </div>

    <ClientOnly>
      <div v-if="exams.length" class="mt-6">
        <h4 class="text-sky-600 text-lg font-bold">搜尋結果：</h4>
        <ul class="mt-2 border border-gray-300 divide-y divide-gray-300 rounded-md overflow-hidden">
          <li
            v-for="{ course, department, examGroups } in groupedExamsWithCourse"
            :key="course"
            class="grid grid-cols-12 divide-x divide-gray-300"
          >
            <div class="col-span-4 px-4 py-2">
              <h6 class="text-lg font-bold">
                {{ course }}
              </h6>

              <div class="mt-1">
                <div class="text-sm text-gray-500">{{ department }}</div>
              </div>
            </div>

            <ul class="col-span-8 divide-y divide-gray-300">
              <template
                v-for="{ examType, exams } in examGroups"
                :key="examType"
              >
                <li class="px-4 py-2 flex justify-between items-center bg-gray-50">
                  <div class="text-gray-500 text-sm">
                    {{ examType === 'midterm' ? '期中考' : '期末考' }}
                  </div>
                  <div class="space-x-2">
                    <Tootip>開啟全部</Tootip>
                    <button
                      type="button"
                      class="inline-flex text-sky-500 hover:text-sky-400 text-sm"
                      :class="{ invisible: exams.length === 0 }"
                      @click="gotoCourceAllExams(examType, 'first', exams)"
                    >
                      正參
                    </button>
                    <button
                      type="button"
                      class="inline-flex text-sky-500 hover:text-sky-400 text-sm"
                      :class="{ invisible: exams.length === 0 }"
                      @click="gotoCourceAllExams(examType, 'second', exams)"
                    >
                      副參
                    </button>
                  </div>
                </li>

                <li
                  v-for="exam in exams"
                  :key="exam.semesterKey"
                  class="px-4 py-2 flex justify-between items-center"
                >
                  <div class="text-sm text-gray-500">
                    {{ exam.semester }} - {{ exam.examType === 'midterm' ? '期中考' : '期末考' }}
                  </div>
                  <div class="space-x-2">
                    <a
                      :href="exam.first"
                      target="_blank"
                      class="inline-flex text-sky-500 hover:text-sky-400 text-sm"
                      :class="{ invisible: !exam.first }"
                    >
                      正參
                    </a>
                    <a
                      :href="exam.second"
                      target="_blank"
                      class="inline-flex text-sky-500 hover:text-sky-400 text-sm"
                      :class="{ invisible: !exam.second }"
                    >
                      副參
                    </a>
                  </div>
                </li>
              </template>
            </ul>
          </li>
        </ul>
      </div>

      <div v-else-if="recentlySearch.length" class="mt-6">
        <div class="flex justify-between items-center">
          <h4 class="text-sky-600 text-lg font-bold">最近搜尋：</h4>
          <button
            type="button"
            class="text-gray-400 hover:text-sky-500 hover:underline text-sm"
            @click="clearRecentlySearch()"
          >
            × 清除最近搜尋
          </button>
        </div>
        <ul class="mt-2 border border-gray-300 divide-y divide-gray-300 rounded-md overflow-hidden">
          <li
            v-for="item in recentlySearch"
            :key="item"
          >
            <button
              type="button"
              class="w-full px-4 py-2 text-sky-500 hover:bg-sky-50 text-left"
              @click="applyRecentlySearch(item)"
            >
              {{ item }}
            </button>
          </li>
        </ul>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import groupBy from 'lodash.groupby'
import type { Exam, ExamType, GroupedExam } from '~/scripts/types'

useHead({
  title: '國立空中大學 考古題查詢',
})

const keyword = ref('')
const autocompleteList = ref<string[]>([])
const recentlySearch = useLocalStorage<string[]>('nou-old-exam:recentlySearch', [])
const exams = ref<Exam[]>([])

const isCompositionTyping = ref(false)

const groupedExamsWithCourse = computed(() => {
  return Object.entries(groupBy(exams.value, 'course'))
    .map(([course, exams]) => {
      const department = exams[0].department

      const newExams = exams
        .map(exam => ({
          ...exam,
          semesterKey: Number.parseInt([
            exam.semester.match(/^\d+/)?.[0] ?? 0,
            exam.examType === 'midterm' ? 1 : 2,
          ].filter(Boolean).join('')),
        } satisfies GroupedExam as GroupedExam))
        .toSorted((a, b) => a.semesterKey - b.semesterKey)

      const examGroups = [
        {
          examType: 'midterm' as ExamType,
          exams: newExams.filter(exam => exam.examType === 'midterm'),
        },
        {
          examType: 'final' as ExamType,
          exams: newExams.filter(exam => exam.examType === 'final'),
        },
      ].filter(({ exams }) => exams.length > 0)

      return { course, department, examGroups }
    })
})

async function autocomplete() {
  if (isCompositionTyping.value) return
  if (!keyword.value) return

  autocompleteList.value = await $fetch('/api/autocomplete', {
    query: { q: keyword.value },
  })
}

async function search() {
  if (!keyword.value) return

  exams.value = await $fetch('/api/search', {
    query: { q: keyword.value },
  })

  autocompleteList.value = []

  if (!recentlySearch.value.includes(keyword.value)) {
    recentlySearch.value = [keyword.value, ...recentlySearch.value]
  }
}

async function applyRecentlySearch(item: string) {
  keyword.value = item
  await search()
}

function gotoCourceAllExams(examType: ExamType, urlType: 'first' | 'second', exams: Exam[]) {
  exams
    .filter(exam => exam.examType === examType)
    .filter(exam => exam[urlType])
    .forEach(exam => {
      window.open(exam[urlType]!, '_blank', 'noopener')
    })
}

function clear() {
  keyword.value = ''
  exams.value = []
}

function clearRecentlySearch() {
  recentlySearch.value = []
}

watch(isCompositionTyping, isCompositionTyping => {
  if (!isCompositionTyping) {
    autocomplete()
  }
})
</script>

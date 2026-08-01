import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MatchRecord } from '../types'
import { loadJSON, saveJSON, removeKey, KEYS } from '../storage/storage'

/** 战绩与历史记录（PRD 9/15：本地战绩、历史记录） */
export const useRecordStore = defineStore('record', () => {
  const records = ref<MatchRecord[]>(loadJSON<MatchRecord[]>(KEYS.records, []))

  function addRecord(record: MatchRecord) {
    records.value.unshift(record)
    if (records.value.length > 200) records.value = records.value.slice(0, 200)
    saveJSON(KEYS.records, records.value)
  }

  function clearRecords() {
    records.value = []
    removeKey(KEYS.records)
  }

  return { records, addRecord, clearRecords }
})

export const DAY_OPTIONS = [
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
  'MINGGU',
] as const

export type DayOfWeekValue = (typeof DAY_OPTIONS)[number]

const dayByIndex: DayOfWeekValue[] = [
  'MINGGU',
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
]

export function parseDateOnly(value: string) {
  const datePart = value.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)

  if (!year || !month || !day) {
    throw new Error('Tanggal tidak valid')
  }

  return new Date(year, month - 1, day)
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDayOfWeek(date: Date) {
  return dayByIndex[date.getDay()]
}

export function formatSchedule(hari?: string | null, jamMulai?: string | null, jamSelesai?: string | null) {
  if (!hari) {
    return 'Belum dijadwalkan'
  }

  if (!jamMulai && !jamSelesai) {
    return hari
  }

  return `${hari}, ${jamMulai || '--:--'}-${jamSelesai || '--:--'}`
}

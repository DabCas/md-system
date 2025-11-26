import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the start of the school week (Friday)
 * School week runs Friday to Thursday
 * @param date - The date to get the week start for
 * @returns Date string (YYYY-MM-DD) of the Friday that starts this week in local timezone
 */
export function getSchoolWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  // Calculate days to subtract to get to Friday
  // Fri(5)=0, Sat(6)=1, Sun(0)=2, Mon(1)=3, Tue(2)=4, Wed(3)=5, Thu(4)=6
  const daysToSubtract = (day + 2) % 7
  d.setDate(d.getDate() - daysToSubtract)
  d.setHours(0, 0, 0, 0)
  // Use local date parts instead of UTC (toISOString converts to UTC which causes timezone issues)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${dayOfMonth}`
}

/**
 * Get the end of the school week (Thursday)
 * @param date - The date to get the week end for
 * @returns Date object set to Thursday 23:59:59 in local timezone
 */
export function getSchoolWeekEnd(date: Date): Date {
  const startStr = getSchoolWeekStart(date)
  // Parse YYYY-MM-DD as local date (adding T00:00:00 forces local parsing)
  const [year, month, day] = startStr.split('-').map(Number)
  const start = new Date(year, month - 1, day) // month is 0-indexed
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Thursday is 6 days after Friday
  end.setHours(23, 59, 59, 999)
  return end
}

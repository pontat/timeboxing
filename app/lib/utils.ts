import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, addSeconds } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (seconds: number): string => {
  const date = addSeconds(new Date(0), seconds)
  return format(date, 'mm:ss')
}

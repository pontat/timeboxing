import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, addSeconds } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

export const sound = () => {
  const audioCtx = new window.AudioContext()

  const oscillator = audioCtx.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime)
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1)
  oscillator.connect(audioCtx.destination)
  oscillator.start(audioCtx.currentTime)
  oscillator.stop(audioCtx.currentTime + 0.2)
}

// envからAPI_URLを取得する
export const API_URL = import.meta.env.VITE_API_URL as string

import { z } from 'zod'
import { json } from '@remix-run/node'
import { prisma } from '../lib/client'
import type { Timebox } from '@prisma/client'

export const loader = async () => {
  const timeboxes = await prisma.timebox.findMany()
  const formattedTimeboxes = timeboxes.map(formattedTimebox)
  return json(formattedTimeboxes)
}

const formattedTimebox = (timebox: Timebox) => ({
  ...timebox,
  duration_seconds: (timebox.end_date_time.getTime() - timebox.start_date_time.getTime()) / 1000,
})

const PostSchema = z.object({
  title: z.string().default('Untitled'),
  duration_minutes: z.number().int().min(1).max(60),
})

const PutSchema = z.object({
  id: z.string().uuid(),
  remaining_seconds: z.coerce.number().min(0),
  status: z.enum(['idle', 'running', 'paused', 'completed']).optional(),
})

const DeleteSchema = z.object({
  id: z.string().uuid(),
})

export const action = async ({ request }: { request: Request }) => {
  try {
    const method = request.method
    const requestData = await request.json()

    if (method === 'POST') {
      const parsedData = PostSchema.safeParse(requestData)

      if (!parsedData.success) {
        return json({ error: 'Invalid data', details: parsedData.error.errors }, { status: 400 })
      }

      const startDateTime = new Date()
      const endDateTime = new Date(startDateTime.getTime() + parsedData.data.duration_minutes * 60 * 1000)

      const timebox = await prisma.timebox.create({
        data: {
          title: parsedData.data.title,
          start_date_time: startDateTime,
          end_date_time: endDateTime,
          remaining_seconds: parsedData.data.duration_minutes * 60,
        },
      })

      return json(formattedTimebox(timebox))
    }

    if (method === 'PUT') {
      const parsedData = PutSchema.safeParse(requestData)

      if (!parsedData.success) {
        return json({ error: 'Invalid data', details: parsedData.error.errors }, { status: 400 })
      }

      const timebox = await prisma.timebox.update({
        where: { id: parsedData.data.id },
        data: parsedData.data,
      })

      return json(timebox)
    }

    if (method === 'DELETE') {
      const parsedData = DeleteSchema.safeParse(requestData)

      if (!parsedData.success) {
        return json({ error: 'Invalid data', details: parsedData.error.errors }, { status: 400 })
      }

      await prisma.timebox.delete({
        where: { id: parsedData.data.id },
      })

      return json({ message: 'Timebox deleted successfully' })
    }

    return json({ error: 'Method not allowed' }, { status: 405 })
  } catch (error) {
    console.error('API Error:', error)
    return json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

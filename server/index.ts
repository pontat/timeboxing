import { Hono } from 'hono'
import { prisma } from './client'

const app = new Hono()

const route = app
  .get('/api/helthcheck', (c) => {
    return c.json({ status: 'ok' })
  })
  .get('/api/timeboxes', async (c) => {
    const tasks = await prisma.timebox.findMany()
    return c.json(tasks)
  })

export default app

// クライアント側で型情報を参照するためexport
export type AppType = typeof route

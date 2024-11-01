import { json } from '@remix-run/node'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit, useNavigation, Form } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { PlayIcon, PauseIcon, CheckIcon, TrashIcon, PlusIcon } from 'lucide-react'
import { formatTime } from '~/lib/utils'

type Task = {
  id: number
  title: string
  duration: number
  remainingTime: number
  status: 'idle' | 'running' | 'paused' | 'completed'
}

// サーバーサイドでタスクを保存する（実際のアプリケーションではデータベースを使用します）
let tasks: Task[] = []

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ tasks })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const action = formData.get('_action')

  switch (action) {
    case 'add': {
      const title = formData.get('title') as string
      const duration = Number.parseInt(formData.get('duration') as string)
      const newTask: Task = { id: Date.now(), title, duration: duration * 60, remainingTime: duration * 60, status: 'idle' }
      tasks.push(newTask)
      break
    }
    case 'update': {
      const id = Number.parseInt(formData.get('id') as string)
      const status = formData.get('status') as Task['status']
      tasks = tasks.map((task) => (task.id === id ? { ...task, status } : task))
      break
    }
    case 'delete': {
      const id = Number.parseInt(formData.get('id') as string)
      tasks = tasks.filter((task) => task.id !== id)
      break
    }
  }

  return json({ success: true })
}

const IndexPage: React.FC = () => {
  const { tasks } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const navigation = useNavigation()
  const [clientTasks, setClientTasks] = useState(tasks)

  useEffect(() => {
    setClientTasks(tasks)
  }, [tasks])

  useEffect(() => {
    const timer = setInterval(() => {
      setClientTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.status === 'running' && task.remainingTime > 0
            ? { ...task, remainingTime: task.remainingTime - 1 }
            : task.status === 'running' && task.remainingTime <= 0
              ? { ...task, status: 'completed' }
              : task,
        ),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">タイムボックス TODO</h1>
      <Form method="post" className="flex gap-2 mb-4">
        <Input type="text" name="title" placeholder="タスク名" required />
        <Input type="number" name="duration" placeholder="時間（分）" required />
        <Button type="submit" name="_action" value="add">
          <PlusIcon className="mr-2 h-4 w-4" /> 追加
        </Button>
      </Form>
      <div className="space-y-4">
        {clientTasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  残り時間: {formatTime(task.remainingTime)} / {formatTime(task.duration)}
                </div>
                <div className="space-x-2">
                  {task.status !== 'completed' && (
                    <>
                      {task.status !== 'running' ? (
                        <Button size="sm" onClick={() => submit({ _action: 'update', id: task.id, status: 'running' }, { method: 'post' })}>
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => submit({ _action: 'update', id: task.id, status: 'paused' }, { method: 'post' })}>
                          <PauseIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" onClick={() => submit({ _action: 'update', id: task.id, status: 'completed' }, { method: 'post' })}>
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => submit({ _action: 'delete', id: task.id }, { method: 'post' })}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default IndexPage

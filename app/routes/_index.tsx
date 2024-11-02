import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { PlayIcon, PauseIcon, TrashIcon, PlusIcon } from 'lucide-react'
import { formatTime } from '~/lib/utils'
import type { Timebox } from '@prisma/client'
import axios from 'axios'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { API_URL } from '~/lib/utils'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response: { data: TimeboxIndex[] } = await axios.get(`${API_URL}/api/timeboxes`)
  return json({ initialTimeboxes: response.data })
}

type TimeboxIndex = Timebox & {
  duration_seconds: number
}

type TimeboxForm = {
  title: string
  duration_minutes: number
}

const IndexPage: React.FC = () => {
  const { initialTimeboxes } = useLoaderData<typeof loader>()
  const [timeboxes, setTimeboxes] = useState(initialTimeboxes)
  const { register, handleSubmit } = useForm<TimeboxForm>()
  const onSubmit: SubmitHandler<TimeboxForm> = (data) => {
    const formattedData = {
      ...data,
      duration_minutes: Number(data.duration_minutes),
    }
    createTimebox(formattedData)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeboxes((prevTimeboxes) =>
        prevTimeboxes.map((timebox) =>
          timebox.status === 'running' && timebox.remaining_seconds > 0
            ? { ...timebox, remaining_seconds: timebox.remaining_seconds - 1 }
            : timebox.status === 'running' && timebox.remaining_seconds <= 0
              ? { ...timebox, status: 'completed' }
              : timebox,
        ),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const createTimebox = async (data: TimeboxForm) => {
    const response = await axios.post(`${API_URL}/api/timeboxes`, data)
    if (response.status === 200) setTimeboxes((prevTimeboxes) => [...prevTimeboxes, response.data])
    if (response.status !== 200) alert('追加に失敗しました')
  }

  const updateTimebox = async (id: string, data: { remaining_seconds: number }) => {
    const response = await axios.put(`${API_URL}/api/timeboxes`, { id, ...data })
    if (response.status !== 200) alert('更新に失敗しました')
  }

  const deleteTimebox = async (id: string) => {
    const response = await axios.delete(`${API_URL}/api/timeboxes`, { data: { id } })
    if (response.status === 200) setTimeboxes((prevTimeboxes) => prevTimeboxes.filter((timebox) => timebox.id !== id))
    if (response.status !== 200) alert('削除に失敗しました')
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">タイムボックス</h1>
      <Form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-4">
        <Input type="text" placeholder="タイムボックス名" required {...register('title')} />
        <Input type="number" placeholder="時間（分）" required {...register('duration_minutes')} />
        <Button type="submit">
          <PlusIcon className="mr-2 h-4 w-4" />
          追加
        </Button>
      </Form>
      <div className="space-y-4">
        {timeboxes.map((timebox) => (
          <Card key={timebox.id}>
            <CardHeader>
              <CardTitle>{timebox.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  残り時間: {formatTime(timebox.remaining_seconds)} / {formatTime(timebox.duration_seconds)}
                </div>
                <div className="space-x-2">
                  {timebox.status !== 'completed' && (
                    <>
                      {timebox.status !== 'running' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setTimeboxes((prevTimeboxes) =>
                              prevTimeboxes.map((prevTimebox) => (prevTimebox.id === timebox.id ? { ...prevTimebox, status: 'running' } : prevTimebox)),
                            )
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setTimeboxes((prevTimeboxes) =>
                              prevTimeboxes.map((prevTimebox) => (prevTimebox.id === timebox.id ? { ...prevTimebox, status: 'idle' } : prevTimebox)),
                            )
                            updateTimebox(timebox.id, { remaining_seconds: timebox.remaining_seconds })
                          }}
                        >
                          <PauseIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {/* <Button size="sm">
                        <CheckIcon className="h-4 w-4" />
                      </Button> */}
                    </>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => deleteTimebox(timebox.id)}>
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

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  TODO_STORE: KVNamespace
}

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

const app = new Hono<{ Bindings: Bindings }>()

// すべてのTodoを取得
app.get('/todos', async (c) => {
  // KVの list メソッドでキーの一覧を取得
  const { keys } = await c.env.TODO_STORE.list({ prefix: 'todo:' })
  
  // 並列でTodoを取得
  const todos = await Promise.all(
    keys.map(async (key) => {
      const todoJson = await c.env.TODO_STORE.get(key.name)
      if (!todoJson) return null
      return JSON.parse(todoJson) as Todo
    })
  )
  
  // nullを除外
  const validTodos = todos.filter((todo): todo is Todo => todo !== null)
  
  return c.json(validTodos)
})

// 特定のTodoを取得
app.get('/todos/:id', async (c) => {
  const id = c.req.param('id')
  const todoJson = await c.env.TODO_STORE.get(`todo:${id}`)
  
  if (!todoJson) {
    throw new HTTPException(404, { message: 'Todo not found' })
  }
  
  const todo = JSON.parse(todoJson) as Todo
  return c.json(todo)
})

// 新しいTodoを作成
app.post('/todos', async (c) => {
  const body = await c.req.json<{ title: string }>()
  
  if (!body.title || typeof body.title !== 'string') {
    throw new HTTPException(400, { message: 'Title is required' })
  }
  
  const id = crypto.randomUUID()
  const todo: Todo = {
    id,
    title: body.title,
    completed: false,
    createdAt: Date.now()
  }
  
  await c.env.TODO_STORE.put(`todo:${id}`, JSON.stringify(todo))
  
  return c.json(todo, 201)
})

// 特定のTodoを更新
app.put('/todos/:id', async (c) => {
  const id = c.req.param('id')
  const todoJson = await c.env.TODO_STORE.get(`todo:${id}`)
  
  if (!todoJson) {
    throw new HTTPException(404, { message: 'Todo not found' })
  }
  
  const existingTodo = JSON.parse(todoJson) as Todo
  const body = await c.req.json<Partial<Pick<Todo, 'title' | 'completed'>>>()
  
  // 更新可能なフィールドだけを更新
  const updatedTodo: Todo = {
    ...existingTodo,
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.completed !== undefined ? { completed: body.completed } : {})
  }
  
  await c.env.TODO_STORE.put(`todo:${id}`, JSON.stringify(updatedTodo))
  
  return c.json(updatedTodo)
})

// 特定のTodoを削除
app.delete('/todos/:id', async (c) => {
  const id = c.req.param('id')
  const todoJson = await c.env.TODO_STORE.get(`todo:${id}`)
  
  if (!todoJson) {
    throw new HTTPException(404, { message: 'Todo not found' })
  }
  
  await c.env.TODO_STORE.delete(`todo:${id}`)
  
  return c.json({ message: 'Todo deleted successfully' }, 200)
})

// エラーハンドリング
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status)
  }
  
  console.error('Unhandled error:', err)
  return c.json({ message: 'Internal Server Error' }, 500)
})

export default app
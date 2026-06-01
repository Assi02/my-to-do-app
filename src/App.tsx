import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { supabase } from './supabase'
import About from './About'

interface Todo {
  id: string
  text: string
  done: boolean
}

function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    const { data } = await supabase.from('todos').select('*').order('created_at')
    if (data) setTodos(data)
    setLoading(false)
  }

  async function addTodo() {
    if (input.trim() === '') return
    const { data } = await supabase.from('todos').insert({ text: input, done: false }).select()
    if (data) setTodos([...todos, data[0]])
    setInput('')
  }

  async function toggleTodo(todo: Todo) {
    await supabase.from('todos').update({ done: !todo.done }).eq('id', todo.id)
    setTodos(todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t))
  }

  async function deleteTodo(id: string) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#6c63ff' }}>✅ To-Do App</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Type a task..."
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
        />
        <button onClick={addTodo} style={{ padding: '10px 16px', borderRadius: 8, background: '#6c63ff', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>Add</button>
      </div>
      {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> :
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginBottom: 8, borderRadius: 8, background: todo.done ? '#f0f0f0' : 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
            <span onClick={() => toggleTodo(todo)} style={{ textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? '#aaa' : '#333', cursor: 'pointer', fontSize: 16 }}>
              {todo.done ? '✅' : '⬜'} {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>❌</button>
          </li>
        ))}
      </ul>}
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>{todos.filter(t => !t.done).length} tasks remaining</p>
      <p style={{ textAlign: 'center' }}><Link to="/about" style={{ color: '#6c63ff' }}>About this app →</Link></p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { supabase } from './supabase'
import About from './About'

interface Todo {
  id: string
  text: string
  done: boolean
}

interface User {
  id: string
  email?: string
}

function Auth({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else if (data.user) onLogin(data.user)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else if (data.user) onLogin(data.user)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#6c63ff' }}>✅ To-Do App</h1>
      <h2 style={{ textAlign: 'center' }}>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 16, boxSizing: 'border-box' }}
      />
      {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
      <button
        onClick={handleSubmit}
        style={{ width: '100%', padding: 12, borderRadius: 8, background: '#6c63ff', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16, marginBottom: 8 }}
      >{isSignUp ? 'Sign Up' : 'Log In'}</button>
      <p style={{ textAlign: 'center', fontSize: 14 }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#6c63ff', cursor: 'pointer' }}> {isSignUp ? 'Log In' : 'Sign Up'}</span>
      </p>
    </div>
  )
}

function Home({ user, onLogout }: { user: User, onLogout: () => void }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTodos() }, [])

  async function fetchTodos() {
    const { data } = await supabase.from('todos').select('*').eq('user_id', user.id).order('created_at')
    if (data) setTodos(data)
    setLoading(false)
  }

  async function addTodo() {
    if (input.trim() === '') return
    const { data } = await supabase.from('todos').insert({ text: input, done: false, user_id: user.id }).select()
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
      <p style={{ textAlign: 'center', fontSize: 14, color: '#aaa' }}>Logged in as {user.email} <span onClick={onLogout} style={{ color: '#6c63ff', cursor: 'pointer' }}>Log out</span></p>
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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Home user={user} onLogout={handleLogout} /> : <Auth onLogin={setUser} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
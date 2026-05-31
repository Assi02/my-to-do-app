import { Link } from 'react-router-dom'

function About() {
  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#6c63ff' }}>About This App</h1>
      <p>A simple To-Do app built with React!</p>
      <p>Built by <strong>Assi02</strong> 🚀</p>
      <Link to="/" style={{ color: '#6c63ff' }}>← Back to To-Do App</Link>
    </div>
  )
}

export default About
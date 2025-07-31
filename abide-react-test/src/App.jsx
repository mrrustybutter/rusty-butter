import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Counter from './components/Counter'

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>HELLO FROM ABIDE - Monaco Fixed!</h1>
      <div className="card">
        <p style={{ marginBottom: '20px', color: '#888' }}>
          This React app was built autonomously using <strong>ABIDE</strong>!
        </p>
        <p style={{ marginBottom: '20px' }}>
          Components created via API endpoints, file system monitoring, and real-time updates.
        </p>
      </div>
      
      <Counter />
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#1e1e1e', 
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#646cff', marginBottom: '16px' }}>
          🚀 ABIDE Features Demonstrated:
        </h3>
        <ul style={{ textAlign: 'left', color: '#ccc', lineHeight: '1.6' }}>
          <li>✅ Detached process spawning (npm run dev)</li>
          <li>✅ Real-time file system monitoring</li>
          <li>✅ Server-client state synchronization</li>
          <li>✅ Dynamic folder expansion</li>
          <li>✅ Component creation via API</li>
          <li>✅ Hot module replacement</li>
        </ul>
      </div>
      
      <p className="read-the-docs">
        Built with total computer autonomy by Rusty Butter! 🎯
      </p>
    </>
  )
}

export default App
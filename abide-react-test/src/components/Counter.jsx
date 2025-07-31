import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #646cff', 
      borderRadius: '8px', 
      textAlign: 'center',
      margin: '20px',
      backgroundColor: '#1a1a1a'
    }}>
      <h2 style={{ color: '#646cff', marginBottom: '16px' }}>
        🚀 ABIDE Counter Component
      </h2>
      <p style={{ fontSize: '24px', margin: '16px 0', color: '#ffffff' }}>
        Count: <span style={{ color: '#646cff', fontWeight: 'bold' }}>{count}</span>
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(count - 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          - Decrease
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          + Increase
        </button>
      </div>
      <p style={{ 
        marginTop: '16px', 
        fontSize: '14px', 
        color: '#888',
        fontStyle: 'italic' 
      }}>
        Built with ABIDE autonomy! 🤖
      </p>
    </div>
  )
}

export default Counter
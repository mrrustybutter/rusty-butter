import { useState, useEffect } from 'react'

function StreamingWidget() {
  const [streamStatus, setStreamStatus] = useState('🔴 LIVE')
  const [viewerCount, setViewerCount] = useState(42)
  const [streamTime, setStreamTime] = useState('02:34:15')

  useEffect(() => {
    // Simulate dynamic viewer count changes
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
      padding: '20px',
      borderRadius: '12px',
      margin: '20px 0',
      boxShadow: '0 8px 16px rgba(255, 107, 107, 0.3)',
      color: '#000',
      fontWeight: 'bold'
    }}>
      <h2 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>
        {streamStatus} Rusty Butter Coding Stream!
      </h2>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '8px 16px',
          borderRadius: '20px'
        }}>
          👥 {viewerCount} viewers
        </div>
        
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '8px 16px',
          borderRadius: '20px'
        }}>
          ⏱️ {streamTime}
        </div>
        
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '8px 16px',
          borderRadius: '20px'
        }}>
          🤖 AI CODING LIVE!
        </div>
      </div>
      
      <p style={{ 
        margin: '15px 0 0 0', 
        fontSize: '0.9rem',
        fontStyle: 'italic'
      }}>
        Autonomous development with ABIDE - Building the future of AI coding!
      </p>
    </div>
  )
}

export default StreamingWidget
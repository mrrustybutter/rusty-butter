'use client'

import { useMemo } from 'react'

interface StreamData {
  id: string
  title: string
  date: Date
  duration: number
  viewCount: number
  url: string
  thumbnail: string
  type: 'vod' | 'live'
}

interface TwitchData {
  isLive: boolean
  currentStream: any
  channel: any
  streamingActivity: StreamData[]
  totalStreams: number
  lastUpdated: string
}

interface Props {
  theme: 'dark' | 'weirdo'
  twitchData: TwitchData | null
  onStreamClick: (stream: any) => void
}

export default function StreamingActivityGraph({ theme, twitchData, onStreamClick }: Props) {
  const activityData = useMemo(() => {
    // Create a year's worth of days
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    
    const days = []
    const streamsByDate = new Map()
    
    // Map streams by date
    if (twitchData?.streamingActivity) {
      twitchData.streamingActivity.forEach(stream => {
        const dateKey = stream.date.toISOString().split('T')[0]
        streamsByDate.set(dateKey, stream)
      })
    }
    
    // Generate all days in the past year
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      const stream = streamsByDate.get(dateKey)
      
      days.push({
        date: new Date(d),
        stream: stream || null,
        intensity: stream ? Math.min(stream.duration / 8, 1) : 0 // Normalize to 0-1 based on 8 hour max
      })
    }
    
    return days
  }, [twitchData])

  return (
    <div className="grid grid-cols-52 gap-1 relative">
      {activityData.map((day, i) => {
        const { date, stream, intensity } = day
        
        return (
          <div key={i} className="relative group">
            <div
              className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${
                theme === 'dark'
                  ? intensity > 0.75 ? 'bg-green-400 hover:ring-2 hover:ring-green-400' 
                    : intensity > 0.5 ? 'bg-green-500 hover:ring-2 hover:ring-green-500'
                    : intensity > 0.25 ? 'bg-green-600 hover:ring-2 hover:ring-green-600'
                    : intensity > 0 ? 'bg-green-800 hover:ring-2 hover:ring-green-800'
                    : 'bg-[#161b22]'
                  : intensity > 0.75 ? 'bg-green-500 hover:ring-2 hover:ring-green-500' 
                    : intensity > 0.5 ? 'bg-green-400 hover:ring-2 hover:ring-green-400'
                    : intensity > 0.25 ? 'bg-green-300 hover:ring-2 hover:ring-green-300'
                    : intensity > 0 ? 'bg-green-200 hover:ring-2 hover:ring-green-200'
                    : 'bg-gray-100'
              }`}
              onClick={() => stream && onStreamClick({
                ...stream,
                date: stream.date.toLocaleDateString(),
                duration: Math.round(stream.duration),
                viewers: stream.viewCount
              })}
            />
            
            {/* Tooltip */}
            {stream && (
              <div className={`absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                px-3 py-2 rounded-md text-xs whitespace-nowrap ${
                theme === 'dark' 
                  ? 'bg-[#161b22] border border-[#30363d] text-[#c9d1d9]' 
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}>
                <div className="font-semibold">{stream.title}</div>
                <div className={theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}>
                  {date.toLocaleDateString()} • {Math.round(stream.duration)}h • {stream.viewCount} views
                </div>
                {stream.type === 'live' && (
                  <div className="text-red-500 text-xs mt-1">● LIVE NOW</div>
                )}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                  border-l-4 border-r-4 border-t-4 ${
                  theme === 'dark' ? 'border-t-[#161b22]' : 'border-t-white'
                } border-l-transparent border-r-transparent`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
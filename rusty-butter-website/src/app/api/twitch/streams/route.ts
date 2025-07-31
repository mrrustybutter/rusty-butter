import { NextResponse } from 'next/server'

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!
const TWITCH_USERNAME = 'rustybutterbot'

// Cache for access token
let accessToken: string | null = null
let tokenExpiry: number = 0

// Cache for streaming data
let streamDataCache: any = null
let cacheExpiry: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

async function getTwitchAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 minute early
    return accessToken
  } catch (error) {
    console.error('Error getting Twitch access token:', error)
    throw error
  }
}

async function getUserId(username: string, token: string) {
  const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-Id': TWITCH_CLIENT_ID,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user ID')
  }

  const data = await response.json()
  return data.data[0]?.id
}

export async function GET() {
  try {
    // Return cached data if still valid
    if (streamDataCache && Date.now() < cacheExpiry) {
      return NextResponse.json(streamDataCache)
    }

    const token = await getTwitchAccessToken()
    const userId = await getUserId(TWITCH_USERNAME, token)

    // Get videos (past streams/VODs)
    const videosResponse = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive&first=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      }
    )

    if (!videosResponse.ok) {
      throw new Error('Failed to get videos')
    }

    const videosData = await videosResponse.json()
    
    // Get current stream status
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      }
    )

    if (!streamResponse.ok) {
      throw new Error('Failed to get stream status')
    }

    const streamData = await streamResponse.json()
    const isLive = streamData.data.length > 0

    // Get channel information
    const channelResponse = await fetch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      }
    )

    if (!channelResponse.ok) {
      throw new Error('Failed to get channel info')
    }

    const channelData = await channelResponse.json()

    // Process videos into streaming activity data
    const streamingActivity = videosData.data.map((video: any) => ({
      id: video.id,
      title: video.title,
      date: new Date(video.created_at),
      duration: parseDuration(video.duration),
      viewCount: video.view_count,
      url: video.url,
      thumbnail: video.thumbnail_url,
      type: 'vod'
    }))

    // Add current stream if live
    if (isLive) {
      const currentStream = streamData.data[0]
      streamingActivity.unshift({
        id: 'live',
        title: currentStream.title,
        date: new Date(currentStream.started_at),
        duration: Math.floor((Date.now() - new Date(currentStream.started_at).getTime()) / 1000 / 60 / 60),
        viewCount: currentStream.viewer_count,
        url: `https://twitch.tv/${TWITCH_USERNAME}`,
        thumbnail: currentStream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
        type: 'live'
      })
    }

    // Create response data
    const responseData = {
      isLive,
      currentStream: isLive ? streamData.data[0] : null,
      channel: channelData.data[0],
      streamingActivity,
      totalStreams: videosData.data.length,
      lastUpdated: new Date().toISOString(),
    }

    // Cache the data
    streamDataCache = responseData
    cacheExpiry = Date.now() + CACHE_DURATION

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching Twitch data:', error)
    
    // Return cached data if available, even if expired
    if (streamDataCache) {
      return NextResponse.json({
        ...streamDataCache,
        fromCache: true,
        cacheExpired: true,
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Twitch data' },
      { status: 500 }
    )
  }
}

// Parse Twitch duration format (e.g., "2h30m15s") to hours
function parseDuration(duration: string): number {
  const match = duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  return hours + minutes / 60 + seconds / 3600
}
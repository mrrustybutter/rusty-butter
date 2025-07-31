import { NextResponse } from 'next/server'

// GitHub public API rate limits:
// - Unauthenticated: 60 requests per hour per IP
// - We cache for 10 minutes to stay well under this limit
// - For higher limits (5000/hour), add GITHUB_TOKEN to env vars

const GITHUB_USERNAME = 'mrrustybutter'
const PINNED_REPOS = [
  'ABIDE',
  'rustybutter-mcp',
  'semantic-memory',
  'rusty-butter'
]

// Cache for GitHub data
let repoDataCache: any = null
let cacheExpiry: number = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes cache

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  homepage: string | null
  private: boolean
}

interface LanguageColors {
  [key: string]: string
}

const languageColors: LanguageColors = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  React: '#61dafb',
}

export async function GET() {
  try {
    // Return cached data if still valid
    if (repoDataCache && Date.now() < cacheExpiry) {
      return NextResponse.json(repoDataCache)
    }

    // Fetch repositories
    const repoPromises = PINNED_REPOS.map(async (repoName) => {
      try {
        const repoResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
          {
            headers: {
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'rusty-butter-website',
              // Optional: Add token for higher rate limits (5000/hour vs 60/hour)
              ...(process.env.GITHUB_TOKEN && {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
              })
            }
          }
        )

        if (!repoResponse.ok) {
          console.error(`Failed to fetch ${repoName}:`, repoResponse.status)
          return null
        }

        const repoData: GitHubRepo = await repoResponse.json()

        // Get language statistics
        const languagesResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`,
          {
            headers: {
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'rusty-butter-website',
              ...(process.env.GITHUB_TOKEN && {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
              })
            }
          }
        )

        let languages = {}
        if (languagesResponse.ok) {
          languages = await languagesResponse.json()
        }

        // Calculate primary language (most bytes)
        const primaryLanguage = Object.entries(languages).reduce((a, b) => 
          (languages as any)[a[0]] > (languages as any)[b[0]] ? a : b, 
          [repoData.language || 'Unknown', 0]
        )[0]

        // Get commit activity (last 52 weeks)
        const commitActivityResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/stats/commit_activity`,
          {
            headers: {
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'rusty-butter-website',
              ...(process.env.GITHUB_TOKEN && {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
              })
            }
          }
        )

        let commitActivity = []
        if (commitActivityResponse.ok) {
          commitActivity = await commitActivityResponse.json()
        }

        return {
          id: repoData.id,
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description || 'No description provided',
          url: repoData.html_url,
          language: primaryLanguage,
          languageColor: languageColors[primaryLanguage] || '#858585',
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          issues: repoData.open_issues_count,
          topics: repoData.topics || [],
          homepage: repoData.homepage,
          private: repoData.private,
          lastUpdated: repoData.pushed_at,
          languages,
          commitActivity
        }
      } catch (error) {
        console.error(`Error fetching ${repoName}:`, error)
        return null
      }
    })

    const repos = await Promise.all(repoPromises)
    const validRepos = repos.filter(repo => repo !== null)

    // Get user data
    const userResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'rusty-butter-website',
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    )

    let userData = null
    if (userResponse.ok) {
      userData = await userResponse.json()
    }

    const responseData = {
      repos: validRepos,
      user: userData ? {
        login: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
      } : null,
      lastUpdated: new Date().toISOString(),
    }

    // Cache the data
    repoDataCache = responseData
    cacheExpiry = Date.now() + CACHE_DURATION

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    
    // Return cached data if available, even if expired
    if (repoDataCache) {
      return NextResponse.json({
        ...repoDataCache,
        fromCache: true,
        cacheExpired: true,
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}
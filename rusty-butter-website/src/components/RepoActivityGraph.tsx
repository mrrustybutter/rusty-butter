'use client'

interface CommitWeek {
  week: number // Unix timestamp
  days: number[] // 7 days, starting Sunday
  total: number
}

interface Props {
  theme: 'dark' | 'weirdo'
  commitActivity: CommitWeek[]
  repoName: string
}

export default function RepoActivityGraph({ theme, commitActivity, repoName }: Props) {
  // Get the last 12 weeks of activity
  const recentActivity = commitActivity.slice(-12)
  
  // Calculate max commits for intensity scaling
  const maxCommits = Math.max(
    ...recentActivity.flatMap(week => week.days),
    1 // Prevent division by zero
  )

  return (
    <div className={`mt-3 pt-3 border-t ${
      theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs ${
          theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
        }`}>Activity</span>
        <span className={`text-xs ${
          theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
        }`}>12 weeks</span>
      </div>
      
      <div className="flex gap-1">
        {recentActivity.map((week, weekIndex) => (
          <div key={week.week} className="flex flex-col gap-1">
            {week.days.map((commits, dayIndex) => {
              const intensity = commits / maxCommits
              const date = new Date(week.week * 1000)
              date.setDate(date.getDate() + dayIndex)
              
              return (
                <div
                  key={dayIndex}
                  className={`w-2 h-2 rounded-sm transition-all ${
                    theme === 'dark'
                      ? intensity > 0.75 ? 'bg-green-400' 
                        : intensity > 0.5 ? 'bg-green-500'
                        : intensity > 0.25 ? 'bg-green-600'
                        : intensity > 0 ? 'bg-green-800'
                        : 'bg-[#161b22]'
                      : intensity > 0.75 ? 'bg-green-500' 
                        : intensity > 0.5 ? 'bg-green-400'
                        : intensity > 0.25 ? 'bg-green-300'
                        : intensity > 0 ? 'bg-green-200'
                        : 'bg-gray-100'
                  }`}
                  title={`${commits} commits on ${date.toLocaleDateString()}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      
      <div className={`text-xs mt-1 ${
        theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
      }`}>
        {commitActivity.reduce((total, week) => total + week.total, 0)} commits in the last year
      </div>
    </div>
  )
}
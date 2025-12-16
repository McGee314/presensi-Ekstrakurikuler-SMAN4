interface CardProps {
  title: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'purple' | 'red'
}

export function StatCard({ title, value, icon, color = 'blue' }: CardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

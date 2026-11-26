export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'NB'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function parseServings(quantity = '') {
  const match = String(quantity).replace(/,/g, '').match(/\d+/)
  return match ? Number(match[0]) : 0
}

export function timeAgo(isoDate) {
  const created = new Date(isoDate).getTime()
  if (Number.isNaN(created)) return 'Recently'

  const minutes = Math.max(0, Math.floor((Date.now() - created) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function roleLabel(user) {
  if (!user) return ''
  if (user.role === 'admin') return 'Administrator'
  if (user.role === 'donor') return 'Donor'
  if (user.subRole === 'distributor') return 'Receiver · Distributor'
  return 'Receiver · Self'
}

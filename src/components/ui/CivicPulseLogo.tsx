import { Link } from 'react-router-dom'

interface CivicPulseLogoProps {
  compact?: boolean
  to?: string
  ariaLabel?: string
}

export function CivicPulseLogo({
  compact = false,
  to = '/',
  ariaLabel = 'Civic Pulse',
}: CivicPulseLogoProps) {
  return (
    <Link to={to} className="brand" aria-label={ariaLabel}>
      <span className="brand__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand__name">
          Civic<span>Pulse</span>
        </span>
      )}
    </Link>
  )
}

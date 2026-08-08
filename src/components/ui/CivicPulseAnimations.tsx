import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { clsx } from 'clsx'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

type RevealStyle = CSSProperties & { '--reveal-delay': string }

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={clsx('reveal', visible && 'reveal--visible', className)}
      style={{ '--reveal-delay': `${delay}ms` } as RevealStyle}
    >
      {children}
    </div>
  )
}

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
}

type BlurWordStyle = CSSProperties & { '--word-delay': string }

export function BlurText({ text, className, delay = 42 }: BlurTextProps) {
  return (
    <span className={clsx('blur-text', className)} aria-label={text}>
      {text.split(' ').map((word, index) => (
        <span
          className="blur-text__word"
          key={`${word}-${index}`}
          style={{ '--word-delay': `${index * delay}ms` } as BlurWordStyle}
          aria-hidden="true"
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  )
}

interface SpotlightCardProps {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()

    if (!rect) return

    ref.current?.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    ref.current?.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={handleMove} className={clsx('spotlight-card', className)}>
      {children}
    </div>
  )
}

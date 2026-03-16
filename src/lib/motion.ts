import { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18, ease: 'easeIn' } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0 } },
}

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const tabContent: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.18 } },
}

// Hover effects (use in whileHover)
export const cardHover = {
  y: -4,
  boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(71,201,229,0.08)',
}

export const btnHover = {
  scale: 1.03,
  boxShadow: '0 0 20px rgba(71,201,229,0.3)',
}

export const btnTap = { scale: 0.97 }

export const rowHover = {
  backgroundColor: 'rgba(71,201,229,0.04)',
}

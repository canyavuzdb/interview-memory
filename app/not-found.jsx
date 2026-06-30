import NotFoundContent from '@/components/NotFoundContent'

export const metadata = {
  title: { absolute: '404 | Interview Memory' },
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return <NotFoundContent />
}

import { useEffect, useState } from 'react'
import Landing from './Landing'
import AppPage from './AppPage'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
  const isApp = hash === '#/app' || hash === '#app' || hash.startsWith('#/app')

  useEffect(() => {
    if (isApp) window.scrollTo(0, 0)
  }, [isApp])

  return isApp ? <AppPage /> : <Landing />
}

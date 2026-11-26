import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import CreatePostPage from './pages/CreatePostPage'
import FeedPage from './pages/FeedPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import { useFood } from './context/FoodContext'

const VALID_VIEWS = ['home', 'login', 'feed', 'create-post', 'admin']

const PAGE_TITLES = {
  home: 'NourishBridge — Surplus food, shared hope',
  login: 'Login / Switch role — NourishBridge',
  feed: 'Live Food Feed — NourishBridge',
  'create-post': 'Post Surplus — NourishBridge',
  admin: 'Admin Console — NourishBridge',
}

export default function App() {
  const { backendConfigured, backendError } = useFood()
  const readView = () => {
    const requested = window.location.hash.replace(/^#\/?/, '').split('/')[0]
    return VALID_VIEWS.includes(requested) ? requested : 'home'
  }
  const [view, setView] = useState(readView)

  const navigate = (nextView) => {
    if (!VALID_VIEWS.includes(nextView)) return
    if (window.location.hash !== `#${nextView}`) {
      window.history.pushState({ view: nextView }, '', `#${nextView}`)
    }
    setView(nextView)
  }

  useEffect(() => {
    const syncView = () => setView(readView())
    window.addEventListener('popstate', syncView)
    window.addEventListener('hashchange', syncView)
    return () => {
      window.removeEventListener('popstate', syncView)
      window.removeEventListener('hashchange', syncView)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = PAGE_TITLES[view] || PAGE_TITLES.home
  }, [view])

  const page = (() => {
    switch (view) {
      case 'login':
        return <LoginPage navigate={navigate} />
      case 'feed':
        return <FeedPage navigate={navigate} />
      case 'create-post':
        return <CreatePostPage navigate={navigate} />
      case 'admin':
        return <AdminPage navigate={navigate} />
      case 'home':
      default:
        return <HomePage navigate={navigate} />
    }
  })()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-cream"
      >
        Skip to content
      </a>
      <Navbar view={view} navigate={navigate} />
      {!backendConfigured && (
        <div role="status" className="bg-saffron-light px-4 py-2 text-center text-xs font-semibold text-forest">
          Local browser storage is active. Connect Supabase before sharing this as a live multi-user site.
        </div>
      )}
      {backendError && (
        <div role="alert" className="bg-clay px-4 py-2 text-center text-xs font-semibold text-white">
          Shared service error: {backendError}
        </div>
      )}
      <div id="main-content" className="flex-1" tabIndex={-1}>
        {page}
      </div>
      <Footer navigate={navigate} />
    </div>
  )
}

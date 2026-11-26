import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  HeartHandshake,
  Home,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  Radio,
  Repeat2,
  Store,
  ShieldCheck,
  X,
} from 'lucide-react'
import BrandMark from './BrandMark'
import { useFood } from '../context/FoodContext'
import { initials, roleLabel } from '../utils/helpers'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'feed', label: 'Live Food Feed', icon: Radio },
  { id: 'create-post', label: 'Post Surplus', icon: PlusCircle, donorCta: true },
  { id: 'admin', label: 'Admin Console', icon: ShieldCheck, adminOnly: true },
]

export default function Navbar({ view, navigate }) {
  const { currentUser, logoutUser } = useFood()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [view])

  const go = (target) => {
    setMobileOpen(false)
    navigate(target)
  }

  const handleLogout = () => {
    logoutUser()
    setMobileOpen(false)
    navigate('home')
  }

  const links = NAV_ITEMS.filter(
    (item) => (item.id !== 'create-post' || currentUser?.role === 'donor') && (!item.adminOnly || currentUser?.role === 'admin'),
  )

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/[0.88] backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go('home')}
          className="group flex shrink-0 items-center gap-3 rounded-full text-left"
          aria-label="NourishBridge home"
        >
          <BrandMark className="h-10 w-10 transition duration-300 group-hover:-rotate-3" />
          <span className="leading-none">
            <span className="block font-display text-[1.35rem] font-semibold tracking-[-0.025em] text-forest-deep">
              Nourish<span className="italic text-clay">Bridge</span>
            </span>
            <span className="mt-1 hidden text-[8px] font-extrabold uppercase tracking-[0.24em] text-forest/45 sm:block">
              Surplus food, shared hope
            </span>
          </span>
        </button>

        <nav
          className="hidden items-center gap-1 rounded-full border border-forest/10 bg-white/55 p-1.5 shadow-[0_1px_0_0_rgb(255_255_255/0.8)_inset] lg:flex"
          aria-label="Primary navigation"
        >
          {links.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            const highlightForDonor =
              item.donorCta && currentUser?.role === 'donor' && !active

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition duration-300 ${
                  active
                    ? 'bg-forest text-cream shadow-[0_8px_20px_-12px_rgb(10_42_32/0.8)]'
                    : highlightForDonor
                      ? 'text-clay hover:bg-saffron-light/60'
                      : 'text-forest/65 hover:bg-forest/5 hover:text-forest'
                }`}
              >
                <Icon size={15} strokeWidth={2.2} />
                {item.label}
                {item.donorCta && currentUser?.role === 'donor' && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-saffron" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              type="button"
              onClick={() => go('login')}
              className="hidden items-center gap-2.5 rounded-full border border-forest/10 bg-white/65 py-1 pl-1 pr-3 text-left transition hover:border-forest/20 hover:bg-white sm:flex"
              title="Your role — tap to switch"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold tracking-tight ${
                  currentUser.role === 'donor'
                    ? 'bg-saffron text-forest-deep'
                    : 'bg-forest text-cream'
                }`}
              >
                {initials(currentUser.name)}
              </span>
              <span className="hidden leading-tight xl:block">
                <span className="block max-w-[9.5rem] truncate text-[11px] font-extrabold text-forest">
                  {currentUser.name}
                </span>
                <span className="mt-0.5 block text-[8px] font-extrabold uppercase tracking-[0.13em] text-forest/50">
                  {roleLabel(currentUser)}
                </span>
              </span>
              <span className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-forest/55 xl:hidden">
                {currentUser.role === 'donor'
                  ? 'Donor'
                  : currentUser.subRole === 'distributor'
                    ? 'Distributor'
                    : 'Receiver'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => go('login')}
            className="btn-primary px-4 py-2.5 text-xs sm:px-5"
          >
            {currentUser ? (
              <>
                <Repeat2 size={15} />
                <span className="hidden sm:inline">Switch role</span>
                <span className="sm:hidden">Role</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                Login
                <ArrowUpRight size={13} className="hidden sm:block" />
              </>
            )}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-10 w-10 place-items-center rounded-full border border-forest/10 bg-white/60 text-forest/55 transition hover:border-clay/30 hover:bg-white hover:text-clay sm:grid"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-white/60 text-forest lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-forest/10 bg-cream lg:hidden"
        >
          <div className="shell py-5">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {links.map((item) => {
                const Icon = item.icon
                const active = view === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
                      active
                        ? 'bg-forest text-cream'
                        : 'text-forest/75 hover:bg-forest/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={17} />
                      {item.label}
                    </span>
                    {item.donorCta && currentUser?.role === 'donor' && (
                      <span className="rounded-full bg-saffron/20 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-clay">
                        Donor
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <div className="mt-4 rounded-3xl border border-forest/10 bg-white/70 p-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-full text-xs font-extrabold ${
                        currentUser.role === 'donor'
                          ? 'bg-saffron text-forest-deep'
                          : 'bg-forest text-cream'
                      }`}
                    >
                      {initials(currentUser.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-forest">
                        {currentUser.name}
                      </p>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-forest/50">
                        {roleLabel(currentUser)}
                        {currentUser.organizationOrArea
                          ? ` · ${currentUser.organizationOrArea}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => go('login')}
                      className="btn-secondary px-4 py-2.5 text-xs"
                    >
                      <Repeat2 size={14} />
                      Switch role
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-clay/20 bg-white px-4 py-2.5 text-xs font-bold text-clay transition hover:bg-clay/5"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-sm font-extrabold text-forest">
                    <HeartHandshake size={17} className="text-clay" />
                    Be part of the bridge.
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink/55">
                    Log in as a donor to share surplus, or as a receiver to
                    claim food for yourself or your community.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => go('login')}
                      className="btn-primary px-4 py-2.5 text-xs"
                    >
                      <LogIn size={14} />
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => go('feed')}
                      className="btn-secondary px-4 py-2.5 text-xs"
                    >
                      <Store size={14} />
                      Browse feed
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

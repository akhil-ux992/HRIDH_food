import { ArrowUpRight, Heart } from 'lucide-react'
import BrandMark from './BrandMark'
import { useFood } from '../context/FoodContext'

export default function Footer({ navigate }) {
  const { backendConfigured } = useFood()

  const goToSection = (sectionId) => {
    navigate('home')
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <footer className="relative overflow-hidden bg-forest-deep text-cream">
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-saffron/10 blur-3xl" />

      <div className="shell relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.8fr_0.9fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-11 w-11" />
              <span className="font-display text-2xl font-semibold tracking-[-0.025em]">
                Nourish<span className="italic text-saffron">Bridge</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
              A live bridge between surplus food and real need. We connect
              kitchens with people who can claim a meal — and with the
              distributors who carry it to those who can’t.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Donors', 'Self receivers', 'Distributors'].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cream/60"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">
              Platform
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { label: 'Home', action: () => navigate('home') },
                { label: 'Live Food Feed', action: () => navigate('feed') },
                { label: 'Post Surplus', action: () => navigate('create-post') },
                { label: 'Login / Switch role', action: () => navigate('login') },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.action}
                    className="group inline-flex items-center gap-1.5 text-cream/60 transition hover:text-cream"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron">
              The bridge
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { label: 'The food crisis', section: 'why' },
                { label: 'How it works', section: 'how-it-works' },
                { label: 'Live impact', section: 'impact' },
                { label: 'Right now on the feed', section: 'live-preview' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => goToSection(item.section)}
                    className="group inline-flex items-center gap-1.5 text-cream/60 transition hover:text-cream"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-cream/[0.12] bg-cream/[0.055] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-saffron">
              {backendConfigured ? 'Community listings' : 'Local preview'}
            </p>
            <p className="mt-2.5 text-sm font-semibold leading-snug text-cream/85">
              {backendConfigured ? 'Your listings are shared with the community.' : 'Your listings are stored in this browser.'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-cream/50">
              {backendConfigured ? 'Sign in from any device to manage listings and coordinate with your community.' : 'Connect the shared service before inviting people to use the site together.'}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/10 pt-6 text-[11px] text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} NourishBridge. Built for a world where
            good food finds a plate.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Made with
            <Heart size={12} className="fill-saffron text-saffron" />
            for the space between surplus and need.
          </p>
        </div>
      </div>
    </footer>
  )
}

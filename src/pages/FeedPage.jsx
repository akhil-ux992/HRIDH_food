import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  HeartHandshake,
  PlusCircle,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'
import ClaimModal from '../components/ClaimModal'
import FoodCard from '../components/FoodCard'
import { useFood } from '../context/FoodContext'
import { FOOD_CATEGORIES } from '../data/seedData'

const STATUS_TABS = [
  { id: 'all', label: 'All listings' },
  { id: 'available', label: 'Available' },
  { id: 'claimed', label: 'Claimed' },
  { id: 'delivered', label: 'Delivered' },
]

const STATUS_ORDER = { available: 0, 'claim-pending': 1, claimed: 2, delivered: 3 }

export default function FeedPage({ navigate }) {
  const { posts, currentUser, stats, claimPost, markDelivered } = useFood()
  const ownsPost = (post) => currentUser?.id ? post.donorId === currentUser.id : post.donorEmail === currentUser?.email
  const ownPendingCount = posts.filter((post) => post.status === 'pending' && ownsPost(post)).length
  const ownRejectedCount = posts.filter((post) => post.status === 'rejected' && ownsPost(post)).length
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [claimTarget, setClaimTarget] = useState(null)
  const [flash, setFlash] = useState('')
  const flashTimer = useRef(null)

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    },
    [],
  )

  const showFlash = (message) => {
    setFlash(message)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(''), 5000)
  }

  const counts = useMemo(
    () => ({
      all: posts.filter((post) => !['pending', 'rejected'].includes(post.status)).length,
      available: posts.filter((post) => post.status === 'available').length,
      claimed: posts.filter((post) => ['claim-pending', 'claimed'].includes(post.status)).length,
      delivered: posts.filter((post) => post.status === 'delivered').length,
    }),
    [posts],
  )

  const categories = useMemo(
    () => [
      'all',
      ...new Set([...FOOD_CATEGORIES, ...posts.map((post) => post.foodCategory)]),
    ],
    [posts],
  )

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return posts
      .filter((post) => !['pending', 'rejected'].includes(post.status))
      .filter((post) => {
        if (statusFilter === 'claimed' && !['claimed', 'claim-pending'].includes(post.status)) return false
        if (statusFilter !== 'all' && statusFilter !== 'claimed' && post.status !== statusFilter) return false
        if (categoryFilter !== 'all' && post.foodCategory !== categoryFilter)
          return false
        if (!normalizedQuery) return true
        return [post.title, post.donorName, post.location, post.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          new Date(b.createdAt) - new Date(a.createdAt),
      )
  }, [posts, statusFilter, categoryFilter, query])

  const filtersActive =
    statusFilter !== 'all' || categoryFilter !== 'all' || query.trim() !== ''

  const clearFilters = () => {
    setStatusFilter('all')
    setCategoryFilter('all')
    setQuery('')
  }

  const openClaim = (post) => {
    if (!currentUser) {
      navigate('login')
      return
    }
    if (currentUser.role !== 'receiver') {
      showFlash('Only receivers can claim food. Switch to a receiver role to continue.')
      return
    }
    setClaimTarget(post)
  }

  const handleConfirmClaim = async (postId, receiverName, subRole, note) => {
    const title = claimTarget?.title
    const claimed = await claimPost(postId, receiverName, subRole, note)
    setClaimTarget(null)
    if (!claimed) {
      showFlash('This listing was just claimed. Refresh the feed to see its latest status.')
      return
    }
    showFlash(
      subRole === 'distributor'
        ? `Request sent for “${title}”. After approval, contact details will be available so you can coordinate delivery.`
        : `Request sent for “${title}”. After approval, contact details will be available so you can coordinate pickup.`,
    )
  }

  const handleDeliver = async (postId) => {
    const post = posts.find((item) => item.id === postId)
    if (!await markDelivered(postId, currentUser?.name)) {
      showFlash('Only the donor or receiver who claimed this listing can mark it delivered.')
      return
    }
    showFlash(
      `Delivered! ${post?.quantity || 'This donation'} marked as rescued. The impact counter just moved.`,
    )
  }

  const postSurplusTarget = currentUser?.role === 'receiver' ? 'login' : 'create-post'

  return (
    <main className="pb-20">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-forest/10 bg-parchment/55">
        <div className="dot-grid-dark pointer-events-none absolute -right-12 top-0 h-64 w-64 opacity-35" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-saffron/10 blur-3xl" />

        <div className="shell relative py-10 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-clay" />
                </span>
                Live food feed
              </span>
              <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.5rem,4.8vw,4.1rem)] font-medium leading-[0.98] tracking-[-0.04em] text-forest-deep">
                Good food, ready for
                <span className="italic text-clay"> its next table.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/55 sm:text-base">
                Browse nearby surplus shared by community donors. Claim it
                for yourself, or pick it up as a distributor and carry it to
                someone who can’t claim online.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch lg:flex-col lg:items-end">
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-forest/10 bg-forest/10">
                {[
                  { value: stats.activeDonations, label: 'Live now' },
                  { value: stats.availableMeals, label: 'Meals available' },
                  { value: stats.communityDistributors, label: 'Distributors' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="min-w-[6.2rem] bg-cream/85 px-3.5 py-3"
                  >
                    <p className="font-display text-xl font-semibold leading-none text-forest">
                      {item.value.toLocaleString('en-IN')}
                    </p>
                    <p className="mt-1.5 text-[6.5px] font-extrabold uppercase tracking-[0.1em] text-forest/40">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate(postSurplusTarget)}
                className="btn-primary px-5 py-3 text-xs"
              >
                <PlusCircle size={15} />
                {currentUser?.role === 'receiver'
                  ? 'Switch to donor'
                  : 'Post surplus'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="shell">
        {/* Filters */}
        <div className="relative z-20 -mt-5 rounded-[1.5rem] border border-forest/10 bg-white p-3 shadow-card sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div
              className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-parchment/60 p-1"
              role="tablist"
              aria-label="Filter listings by status"
            >
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-[11px] font-bold transition ${
                      active
                        ? 'bg-forest text-cream shadow-sm'
                        : 'text-forest/55 hover:bg-white/70 hover:text-forest'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold ${
                        active
                          ? 'bg-cream/15 text-cream/80'
                          : 'bg-forest/[0.06] text-forest/45'
                      }`}
                    >
                      {counts[tab.id]}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/35"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search food, donor or area"
                  aria-label="Search listings"
                  className="field py-2.5 pl-9 pr-3 text-[11px] sm:w-60"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal
                  size={13}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/35"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter by food category"
                  className="field appearance-none py-2.5 pl-9 pr-9 text-[11px] sm:w-48"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All categories' : category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-forest/35"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-forest/40">
            Showing {filteredPosts.length}{' '}
            {filteredPosts.length === 1 ? 'listing' : 'listings'}
            {query.trim() ? ` for “${query.trim()}”` : ''}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start text-[10px] font-bold text-clay transition hover:text-forest sm:self-auto"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        {filteredPosts.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <FoodCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onClaim={openClaim}
                onDeliver={handleDeliver}
                onLogin={() => navigate('login')}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[2rem] border border-dashed border-forest/20 bg-white/50 px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-saffron-light text-clay">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-4 font-display text-2xl font-medium text-forest-deep">
              No listings match that view.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/45">
              Try a different status or category — or be the one who starts the
              next bridge by posting surplus.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary px-5 py-2.5 text-xs"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => navigate(postSurplusTarget)}
                className="btn-primary px-5 py-2.5 text-xs"
              >
                <PlusCircle size={14} />
                Post surplus
              </button>
            </div>
          </div>
        )}

        {/* Role-aware helper */}
        <div className="mt-10">
          {currentUser?.role === 'donor' && (ownPendingCount > 0 || ownRejectedCount > 0) && (
            <div className="mb-4 rounded-2xl border border-saffron/30 bg-saffron-light/60 p-4 text-sm text-forest">
              {ownPendingCount > 0 && <p><strong>{ownPendingCount}</strong> {ownPendingCount === 1 ? 'listing is' : 'listings are'} waiting for administrator approval before appearing in the live feed.</p>}
              {ownRejectedCount > 0 && <p className="mt-1"><strong>{ownRejectedCount}</strong> {ownRejectedCount === 1 ? 'listing was' : 'listings were'} not approved. Contact the administrator for details.</p>}
            </div>
          )}
          {currentUser?.role === 'receiver' ? (
            <div className="flex flex-col gap-4 rounded-3xl bg-forest p-5 text-cream sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cream/15 bg-cream/5 text-saffron">
                  {currentUser.subRole === 'distributor' ? (
                    <Truck size={17} />
                  ) : (
                    <HeartHandshake size={17} />
                  )}
                </span>
                <div>
                  <p className="text-xs font-extrabold">
                    You’re browsing as a{' '}
                    {currentUser.subRole === 'distributor'
                      ? 'community distributor'
                      : 'self receiver'}
                    .
                  </p>
                  <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-cream/50">
                    {currentUser.subRole === 'distributor'
                      ? 'Claim any available listing, then add where you’ll deliver so the donor knows the loop is closed.'
                      : 'Claim any available listing for yourself or your family. The donor will see your name and note.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="shrink-0 rounded-full border border-cream/20 px-4 py-2.5 text-[10px] font-bold text-cream/75 transition hover:border-cream/35 hover:bg-cream/5 hover:text-cream"
              >
                Switch role
              </button>
            </div>
          ) : currentUser?.role === 'donor' ? (
            <div className="flex flex-col gap-4 rounded-3xl border border-forest/10 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-saffron-light text-clay">
                  <Check size={17} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-forest">
                    You’re browsing as a donor.
                  </p>
                  <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-ink/45">
                    Once a claimed listing reaches its destination, use “Mark as
                    delivered” to close the loop and move the live impact
                    counters.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('create-post')}
                className="btn-primary shrink-0 px-4 py-2.5 text-[10px]"
              >
                <PlusCircle size={13} />
                Post surplus
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-3xl border border-forest/10 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest/5 text-forest">
                  <Radio size={17} />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-forest">
                    You’re browsing as a guest.
                  </p>
                  <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-ink/45">
                    Log in to claim a meal as a receiver, or to share surplus as
                    a donor. Distributors can deliver on behalf of people
                    without smartphones.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="btn-primary shrink-0 px-4 py-2.5 text-[10px]"
              >
                Login / switch role
              </button>
            </div>
          )}
        </div>
      </div>

      {flash && (
        <div
          role="status"
          aria-live="polite"
          className="toast-in fixed bottom-5 left-1/2 z-[90] flex w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-cream/15 bg-forest-deep px-4 py-3.5 text-cream shadow-soft"
        >
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-saffron text-forest-deep">
            <Check size={13} strokeWidth={3} />
          </span>
          <p className="flex-1 text-[11.5px] font-semibold leading-relaxed">
            {flash}
          </p>
          <button
            type="button"
            onClick={() => setFlash('')}
            className="mt-0.5 text-cream/45 transition hover:text-cream"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {claimTarget && currentUser && (
        <ClaimModal
          post={claimTarget}
          currentUser={currentUser}
          onClose={() => setClaimTarget(null)}
          onConfirm={handleConfirmClaim}
        />
      )}
    </main>
  )
}

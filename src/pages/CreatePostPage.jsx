import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Clock,
  HeartHandshake,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Utensils,
} from 'lucide-react'
import SmartImage from '../components/SmartImage'
import { useFood } from '../context/FoodContext'
import {
  DONOR_TYPES,
  FOOD_CATEGORIES,
  PHOTO_OPTIONS,
} from '../data/seedData'
import { initials, roleLabel } from '../utils/helpers'

const CHECKLIST = [
  'A clear, honest quantity — “serves 40” beats “some food”.',
  'A realistic pickup window so the food stays fresh.',
  'A short description of what’s inside and how it’s packed.',
]

function AccessGate({
  icon: Icon,
  eyebrow,
  title,
  copy,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  note,
}) {
  return (
    <main className="relative overflow-hidden py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_50%_0%,#f8e6c4_0%,transparent_55%)]" />
      <div className="shell">
        <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-forest/10 bg-white p-7 text-center shadow-soft sm:p-11">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-saffron-light text-clay">
            <Icon size={28} strokeWidth={1.7} />
          </span>
          <span className="eyebrow mt-6">{eyebrow}</span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.035em] text-forest-deep">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink/50">
            {copy}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onPrimary}
              className="btn-primary px-6 py-3.5 text-xs"
            >
              {primaryLabel}
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={onSecondary}
              className="btn-secondary px-6 py-3.5 text-xs"
            >
              {secondaryLabel}
            </button>
          </div>
          <p className="mt-5 text-[10px] text-ink/35">{note}</p>
        </div>
      </div>
    </main>
  )
}

export default function CreatePostPage({ navigate }) {
  const { currentUser, addPost } = useFood()

  const suggestedArea = currentUser?.organizationOrArea?.includes(',')
    ? currentUser.organizationOrArea.split(',').slice(1).join(',').trim()
    : currentUser?.organizationOrArea || ''

  const [form, setForm] = useState({
    title: '',
    donorType: 'Restaurant',
    foodCategory: 'Cooked Meals',
    quantity: '',
    location: suggestedArea,
    expiresIn: '',
    description: '',
    imageUrl: PHOTO_OPTIONS[0].url,
  })
  const [error, setError] = useState('')

  if (!currentUser) {
    return (
      <AccessGate
        icon={Store}
        eyebrow="Donor access"
        title="Posting surplus starts with a donor."
        copy="Log in as a donor to list food from your restaurant, event, bakery, campus or home. It takes under a minute — and a receiver could claim it just as fast."
        primaryLabel="Login as a donor"
        onPrimary={() => navigate('login')}
        secondaryLabel="Explore live feed"
        onSecondary={() => navigate('feed')}
        note="Already a receiver? You can switch roles in one click."
      />
    )
  }

  if (currentUser.role === 'admin') {
    return <AccessGate icon={Store} eyebrow="Administrator account" title="Review donations in the admin console." copy="Administrator accounts oversee submissions. Sign in as a donor account to publish a food listing." primaryLabel="Open admin console" onPrimary={() => navigate('admin')} secondaryLabel="Browse the food feed" onSecondary={() => navigate('feed')} note="Donor accounts can create listings for review." />
  }

  if (currentUser.role === 'receiver') {
    return (
      <AccessGate
        icon={
          currentUser.subRole === 'distributor' ? Truck : HeartHandshake
        }
        eyebrow={roleLabel(currentUser)}
        title="You’re on the receiving side of the bridge."
        copy={
          currentUser.subRole === 'distributor'
            ? 'Distributors claim and deliver surplus — they don’t list it. If you also have surplus to share, switch to a donor role for a moment.'
            : 'Self receivers claim meals rather than post them. If you also have surplus food to share, switch to a donor role for a moment.'
        }
        primaryLabel="Switch to donor"
        onPrimary={() => navigate('login')}
        secondaryLabel="Browse the live feed"
        onSecondary={() => navigate('feed')}
        note="The live feed is where receivers claim available donations."
      />
    )
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Give your listing a short, clear title.')
      return
    }
    if (!form.quantity.trim()) {
      setError('Add the quantity — for example, “Serves 40”.')
      return
    }
    if (!form.location.trim()) {
      setError('Add a pickup area so receivers can find you.')
      return
    }
    if (!form.expiresIn.trim()) {
      setError('Add a pickup window so the food is collected while fresh.')
      return
    }
    if (!form.description.trim()) {
      setError('Add a short description of the food and how it’s packed.')
      return
    }

    setError('')
    try {
      await addPost({
        donorName: currentUser.name,
        donorType: form.donorType,
        title: form.title,
        description: form.description,
        quantity: form.quantity,
        foodCategory: form.foodCategory,
        location: form.location,
        expiresIn: form.expiresIn,
        imageUrl: form.imageUrl,
      })
      navigate('feed')
    } catch (submitError) {
      setError(submitError.message || 'Could not submit this listing. Please try again.')
    }
  }

  return (
    <main className="pb-20">
      <section className="relative overflow-hidden border-b border-forest/10 bg-parchment/55">
        <div className="dot-grid-dark pointer-events-none absolute -right-10 top-0 h-64 w-64 opacity-35" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-saffron/10 blur-3xl" />
        <div className="shell relative flex flex-col gap-7 py-10 lg:flex-row lg:items-end lg:justify-between lg:py-14">
          <div>
            <span className="eyebrow">
              <PlusCircle size={12} className="text-clay" />
              Post surplus
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.5rem,4.8vw,4.1rem)] font-medium leading-[0.98] tracking-[-0.04em] text-forest-deep">
              Turn today’s surplus into
              <span className="italic text-clay"> tonight’s meal.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/55 sm:text-base">
              Tell receivers what’s left, where to pick it up, and how soon it
              needs a home. A clear listing is a claimed listing.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-white/65 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron text-[10px] font-extrabold text-forest-deep">
              {initials(currentUser.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-forest">
                {currentUser.name}
              </p>
              <p className="truncate text-[9px] text-ink/40">
                {currentUser.organizationOrArea || 'NourishBridge donor'}
              </p>
            </div>
            <span className="ml-2 shrink-0 rounded-full bg-forest px-2.5 py-1 text-[7px] font-extrabold uppercase tracking-[0.12em] text-cream">
              Donor
            </span>
          </div>
        </div>
      </section>

      <div className="shell mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-forest/10 bg-white p-5 shadow-card sm:p-8"
          noValidate
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-medium text-forest-deep">
                Listing details
              </h2>
              <p className="mt-1 text-[11px] text-ink/40">
                Everything marked below helps a receiver say yes faster.
              </p>
            </div>
            <span className="hidden rounded-full border border-forest/10 bg-cream/60 px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-forest/40 sm:block">
              Step 1 of 1
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="post-title" className="label">
                <Utensils size={12} className="text-clay" />
                What’s available?
              </label>
              <input
                id="post-title"
                type="text"
                value={form.title}
                onChange={updateField('title')}
                maxLength={90}
                placeholder="e.g., Surplus lunch buffet — freshly cooked"
                className="field"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="post-category" className="label">
                  <Sparkles size={12} className="text-clay" />
                  Food category
                </label>
                <div className="relative">
                  <select
                    id="post-category"
                    value={form.foodCategory}
                    onChange={updateField('foodCategory')}
                    className="field appearance-none pr-9"
                  >
                    {FOOD_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-forest/35"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="post-donor-type" className="label">
                  <Store size={12} className="text-clay" />
                  Donor type
                </label>
                <div className="relative">
                  <select
                    id="post-donor-type"
                    value={form.donorType}
                    onChange={updateField('donorType')}
                    className="field appearance-none pr-9"
                  >
                    {DONOR_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-forest/35"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="post-quantity" className="label">
                  <Utensils size={12} className="text-clay" />
                  Quantity
                </label>
                <input
                  id="post-quantity"
                  type="text"
                  value={form.quantity}
                  onChange={updateField('quantity')}
                  placeholder="e.g., Serves 40"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="post-expiry" className="label">
                  <Clock size={12} className="text-clay" />
                  Pickup window
                </label>
                <input
                  id="post-expiry"
                  type="text"
                  value={form.expiresIn}
                  onChange={updateField('expiresIn')}
                  placeholder="e.g., Pickup by 9:30 PM today"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="post-location" className="label">
                <MapPin size={12} className="text-clay" />
                Pickup area
              </label>
              <input
                id="post-location"
                type="text"
                value={form.location}
                onChange={updateField('location')}
                placeholder="e.g., Indiranagar, Bengaluru"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="post-description" className="label">
                <HeartHandshake size={12} className="text-clay" />
                What’s inside?
              </label>
              <textarea
                id="post-description"
                value={form.description}
                onChange={updateField('description')}
                rows={4}
                maxLength={280}
                placeholder="e.g., Dal, seasonal sabzi, jeera rice, rotis and salad from today’s lunch service. Packed in food-grade containers."
                className="field resize-none"
              />
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink/35">
                <span>Mention packaging, allergens or anything a receiver should know.</span>
                <span>{form.description.length}/280</span>
              </div>
            </div>

            <div>
              <span className="label">
                <Camera size={12} className="text-clay" />
                Choose a photo
              </span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PHOTO_OPTIONS.map((photo) => {
                  const selected = form.imageUrl === photo.url
                  return (
                    <button
                      key={photo.label}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, imageUrl: photo.url }))
                      }
                      aria-pressed={selected}
                      aria-label={`Use photo: ${photo.label}`}
                      title={photo.label}
                      className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                        selected
                          ? 'border-saffron ring-2 ring-saffron/20'
                          : 'border-transparent hover:border-forest/20'
                      }`}
                    >
                      <SmartImage
                        src={photo.url}
                        alt={photo.label}
                        className="h-full w-full"
                        imgClassName="transition duration-500 group-hover:scale-105"
                      />
                      {selected && (
                        <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-saffron text-forest-deep shadow-sm">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-[10px] text-ink/35">
                Choose a photo that best matches the food you are sharing.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-clay/20 bg-clay/[0.06] px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-clay"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 border-t border-forest/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xs text-[9px] leading-relaxed text-ink/35">
              By posting, you confirm the food is safe, edible and available for
              pickup. Your listing will be stored in this browser.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('feed')}
                className="btn-secondary px-5 py-3 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6 py-3 text-xs">
                Publish listing
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-[1.75rem] border border-forest/10 bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-forest/40">
                Live preview
              </p>
              <span className="inline-flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-moss">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-moss" />
                Draft
              </span>
            </div>

            <div className="overflow-hidden rounded-[1.25rem] border border-forest/10 bg-cream">
              <div className="relative">
                <SmartImage
                  src={form.imageUrl}
                  alt="Listing preview"
                  className="h-40 w-full"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/30 to-transparent" />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-forest px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-cream">
                  <span className="h-1 w-1 rounded-full bg-saffron" />
                  New listing
                </span>
                <span className="absolute bottom-2.5 left-2.5 text-[8px] font-bold text-cream/80">
                  {form.foodCategory}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-forest/[0.06] text-[8px] font-extrabold text-forest">
                    {initials(currentUser.name)}
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold text-forest">
                      {currentUser.name}
                    </p>
                    <p className="text-[7px] font-extrabold uppercase tracking-[0.1em] text-forest/35">
                      {form.donorType}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 font-display text-lg font-medium leading-tight text-forest-deep">
                  {form.title.trim() || 'Your surplus listing'}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-ink/45">
                  {form.description.trim() ||
                    'A short description of what’s inside will appear here.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-forest/10 pt-3 text-[9px] font-semibold text-ink/45">
                  <span className="flex items-center gap-1">
                    <Utensils size={10} className="text-moss" />
                    {form.quantity.trim() || 'Quantity'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} className="text-moss" />
                    {form.location.trim() || 'Pickup area'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} className="text-moss" />
                    {form.expiresIn.trim() || 'Pickup window'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-center rounded-full bg-forest/5 py-2 text-[7.5px] font-extrabold uppercase tracking-[0.1em] text-forest/40">
                  Visible after administrator approval
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-forest/10 bg-saffron-light/40 p-5">
            <p className="flex items-center gap-2 text-[8px] font-extrabold uppercase tracking-[0.16em] text-clay">
              <Sparkles size={12} />
              A listing ready for review
            </p>
            <ul className="mt-4 space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex gap-2.5 text-[11px] leading-relaxed text-forest/65">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white text-moss">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] bg-forest p-5 text-cream">
            <p className="flex items-center gap-2 text-[8px] font-extrabold uppercase tracking-[0.16em] text-saffron">
              <ShieldCheck size={12} />
              Small act, real impact
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-cream/55">
              Your listing appears at the top of the live feed immediately.
              When a receiver claims it, you’ll see their name and note on the
              card. When it’s delivered, the impact counters move.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

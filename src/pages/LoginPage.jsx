import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
    Check,
  HeartHandshake,
  LogOut,
  MapPin,
    Smartphone,
  Store,
  Truck,
  UserRound,
} from 'lucide-react'
import BrandMark from '../components/BrandMark'
import CountUp from '../components/CountUp'
import { useFood } from '../context/FoodContext'
import { initials, roleLabel } from '../utils/helpers'
import { isSupabaseConfigured } from '../lib/supabase'

const ROLE_NOTES = [
  {
    icon: Store,
    title: 'Donors',
    copy: 'Share surplus from kitchens, events and homes.',
  },
  {
    icon: Smartphone,
    title: 'Self receivers',
    copy: 'Claim a meal directly, with dignity and speed.',
  },
  {
    icon: Truck,
    title: 'Distributors',
    copy: 'Carry meals to elderly, homeless and offline neighbours.',
  },
]

export default function LoginPage({ navigate }) {
  const { currentUser, stats, hasAccounts, backendConfigured, registerOrLogin, logoutUser } = useFood()
  const [mode, setMode] = useState(isSupabaseConfigured || hasAccounts ? 'login' : 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [phoneChanged, setPhoneChanged] = useState(false)
  const [role, setRole] = useState(currentUser?.role || 'donor')
  const [subRole, setSubRole] = useState(currentUser?.subRole || 'self')
  const [name, setName] = useState(currentUser?.name || '')
  const [organizationOrArea, setOrganizationOrArea] = useState(
    currentUser?.organizationOrArea || '',
  )
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isReceiver = role === 'receiver'
  const OrgIcon = isReceiver
    ? subRole === 'distributor'
      ? Truck
      : MapPin
    : Store

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Use a password with at least 8 characters.')

    if (mode === 'register' && !name.trim()) {
      setError('Please add your name so donors and receivers know who you are.')
      return
    }

    if (mode === 'register' && !organizationOrArea.trim()) {
      setError(
        isReceiver
          ? 'Please add your area or the community you serve.'
          : 'Please add your restaurant, organization or household area.',
      )
      return
    }
    if (mode === 'register' && phone.replace(/\D/g, '').length < 8) {
      setError('Add a phone number with country code so approved requests can coordinate on WhatsApp.')
      return
    }

    setError('')
    const result = await registerOrLogin({
      email,
      password,
      phone: phoneChanged ? phone : '',
      name,
      role,
      subRole: isReceiver ? subRole : null,
      organizationOrArea,
    }, mode)
    if (result.error) return setError(result.error)
    if (result.message) {
      setNotice(result.message)
      return
    }
    navigate('feed')
  }

  const handleSignOut = () => {
    logoutUser()
    setPhone('')
    setPhoneChanged(false)
    setEmail('')
    setPassword('')
    setName('')
    setOrganizationOrArea('')
    setRole('donor')
    setSubRole('self')
    setError('')
    setNotice('Signed out. Choose a role to continue.')
  }

  const submitLabel = mode === 'login' ? 'Sign in' : isReceiver
    ? subRole === 'distributor'
      ? 'Continue as distributor'
      : 'Continue as self receiver'
    : 'Continue as donor'

  return (
    <main className="relative overflow-hidden py-10 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_18%_0%,#f8e6c4_0%,transparent_48%)]" />

      <div className="shell grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        {/* Story panel */}
        <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-forest-deep p-8 text-cream shadow-soft lg:flex lg:flex-col lg:p-10">
          <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-saffron/10 blur-3xl" />
          <svg
            className="pointer-events-none absolute -bottom-10 left-0 w-full opacity-20"
            viewBox="0 0 620 220"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M-20 190C110 45 510 45 640 190"
              stroke="#E9A23B"
              strokeWidth="2"
            />
            <path d="M-20 190H640" stroke="#FAF6EE" strokeWidth="1" />
            <path
              d="M105 190v-55M210 190v-83M315 190v-93M420 190v-83M525 190v-55"
              stroke="#FAF6EE"
              strokeWidth="1.5"
            />
          </svg>

          <div className="relative">
            <div className="flex items-center gap-3">
              <BrandMark className="h-10 w-10" />
              <span className="font-display text-xl font-semibold tracking-[-0.02em]">
                Nourish<span className="italic text-saffron">Bridge</span>
              </span>
            </div>

            <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-saffron">
              <HeartHandshake size={12} />
              The three-way bridge
            </span>

            <h2 className="mt-5 font-display text-[clamp(2.5rem,3.7vw,3.6rem)] font-medium leading-[0.98] tracking-[-0.04em]">
              Every role
              <span className="block italic text-saffron">moves a meal.</span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/55">
              A donor with surplus. A receiver with a need. A distributor with a
              route. One bridge, three ways to make sure good food finds a plate.
            </p>

            <div className="mt-8 space-y-4">
              {ROLE_NOTES.map((note) => {
                const Icon = note.icon
                return (
                  <div key={note.title} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cream/12 bg-cream/5 text-saffron">
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="text-[11px] font-extrabold text-cream/90">
                        {note.title}
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-relaxed text-cream/40">
                        {note.copy}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative mt-auto pt-10">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10">
              {[
                { value: stats.mealsRescued, label: 'Meals rescued' },
                { value: stats.activeDonations, label: 'Live donations' },
                { value: stats.communityDistributors, label: 'Distributors' },
              ].map((item) => (
                <div key={item.label} className="bg-forest-deep p-3.5">
                  <p className="font-display text-xl font-semibold text-cream">
                    <CountUp value={item.value} />
                  </p>
                  <p className="mt-1 text-[7px] font-extrabold uppercase tracking-[0.12em] text-cream/35">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 font-display text-lg italic leading-snug text-cream/45">
              “Good food shouldn’t need a miracle. Just a bridge.”
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-[2.5rem] border border-forest/10 bg-white/65 p-5 shadow-card backdrop-blur-sm sm:p-8 lg:p-9">
          {currentUser && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-forest/10 bg-cream/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                    currentUser.role === 'donor'
                      ? 'bg-saffron text-forest-deep'
                      : 'bg-forest text-cream'
                  }`}
                >
                  {initials(currentUser.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-forest/35">
                    Currently signed in
                  </p>
                  <p className="truncate text-xs font-extrabold text-forest">
                    {currentUser.name}{' '}
                    <span className="font-semibold text-forest/45">
                      · {roleLabel(currentUser)}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-clay/20 bg-white px-3.5 py-2 text-[10px] font-bold text-clay transition hover:bg-clay/5"
              >
                <LogOut size={12} />
                Sign out
              </button>
            </div>
          )}

          <span className="eyebrow">
            <UserRound size={12} className="text-clay" />
            {mode === 'register' ? 'Create account' : 'Sign in'} / switch role
          </span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.035em] text-forest-deep">
            Who are you
            <span className="italic text-clay"> on the bridge?</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/50">
            Create an account or sign in. Donors share surplus, receivers
            claim it, and distributors carry it to people who can’t claim online.
          </p>

          <form onSubmit={handleSubmit} className="mt-7" noValidate>
            <fieldset>
              <legend className="label">Choose your role</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('donor')
                    setError('')
                  }}
                  aria-pressed={role === 'donor'}
                  className={`relative rounded-2xl border p-4 text-left transition duration-300 ${
                    role === 'donor'
                      ? 'border-forest bg-forest text-cream shadow-lift'
                      : 'border-forest/10 bg-cream/50 hover:border-forest/25 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                        role === 'donor'
                          ? 'bg-saffron text-forest-deep'
                          : 'bg-forest/5 text-forest'
                      }`}
                    >
                      <Store size={18} strokeWidth={1.8} />
                    </span>
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                        role === 'donor'
                          ? 'border-saffron bg-saffron text-forest-deep'
                          : 'border-forest/15 text-transparent'
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-extrabold">Donor</p>
                  <p
                    className={`mt-1 text-[11px] leading-relaxed ${
                      role === 'donor' ? 'text-cream/55' : 'text-ink/45'
                    }`}
                  >
                    I have surplus food from my kitchen, café or event.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('receiver')
                    setError('')
                  }}
                  aria-pressed={role === 'receiver'}
                  className={`relative rounded-2xl border p-4 text-left transition duration-300 ${
                    role === 'receiver'
                      ? 'border-forest bg-forest text-cream shadow-lift'
                      : 'border-forest/10 bg-cream/50 hover:border-forest/25 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                        role === 'receiver'
                          ? 'bg-saffron text-forest-deep'
                          : 'bg-forest/5 text-forest'
                      }`}
                    >
                      <HeartHandshake size={18} strokeWidth={1.8} />
                    </span>
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                        role === 'receiver'
                          ? 'border-saffron bg-saffron text-forest-deep'
                          : 'border-forest/15 text-transparent'
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-extrabold">Receiver</p>
                  <p
                    className={`mt-1 text-[11px] leading-relaxed ${
                      role === 'receiver' ? 'text-cream/55' : 'text-ink/45'
                    }`}
                  >
                    I need food, or I deliver it to people who do.
                  </p>
                </button>
              </div>
            </fieldset>

            {isReceiver && (
              <fieldset className="mt-5 rounded-2xl border border-forest/10 bg-cream/50 p-3.5">
                <legend className="label px-1">How will you receive?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSubRole('self')}
                    aria-pressed={subRole === 'self'}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                      subRole === 'self'
                        ? 'border-clay/35 bg-white shadow-sm'
                        : 'border-transparent bg-transparent hover:bg-white/60'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        subRole === 'self'
                          ? 'bg-saffron-light text-clay'
                          : 'bg-forest/5 text-forest/50'
                      }`}
                    >
                      <Smartphone size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-forest">
                        Self receiver
                        {subRole === 'self' && (
                          <Check size={11} className="text-clay" strokeWidth={3} />
                        )}
                      </span>
                      <span className="mt-0.5 block text-[9.5px] leading-snug text-ink/40">
                        Claim food for yourself or your family.
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubRole('distributor')}
                    aria-pressed={subRole === 'distributor'}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                      subRole === 'distributor'
                        ? 'border-clay/35 bg-white shadow-sm'
                        : 'border-transparent bg-transparent hover:bg-white/60'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        subRole === 'distributor'
                          ? 'bg-saffron-light text-clay'
                          : 'bg-forest/5 text-forest/50'
                      }`}
                    >
                      <Truck size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-forest">
                        Distributor
                        {subRole === 'distributor' && (
                          <Check size={11} className="text-clay" strokeWidth={3} />
                        )}
                      </span>
                      <span className="mt-0.5 block text-[9.5px] leading-snug text-ink/40">
                        Pick up and deliver to offline neighbours.
                      </span>
                    </span>
                  </button>
                </div>
              </fieldset>
            )}

            <div>
              <label htmlFor="login-email" className="label">Email address</label>
              <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="field" />
            </div>
            <div className="mt-4">
              <label htmlFor="login-password" className="label">Password</label>
              <input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="field" />
            </div>
            <div className="mt-4">
              <label htmlFor="login-phone" className="label">WhatsApp phone number {mode === 'login' && <span className="normal-case tracking-normal text-ink/35">(optional, update saved number)</span>}</label>
              <input id="login-phone" type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setPhoneChanged(true) }} placeholder="e.g. +91 98765 43210" autoComplete="tel" className="field" />
            </div>
            {mode === 'register' && <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="login-name" className="label">
                  <UserRound size={12} className="text-clay" />
                  Your name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Aarav Shah"
                  autoComplete="name"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="login-area" className="label">
                  <OrgIcon size={12} className="text-clay" />
                  {isReceiver
                    ? subRole === 'distributor'
                      ? 'Organization / area you serve'
                      : 'Your area'
                    : 'Restaurant / organization'}
                </label>
                <input
                  id="login-area"
                  type="text"
                  value={organizationOrArea}
                  onChange={(event) => setOrganizationOrArea(event.target.value)}
                  placeholder={
                    isReceiver
                      ? subRole === 'distributor'
                        ? 'e.g., Sunrise Elder Care, North Bengaluru'
                        : 'e.g., Koramangala, Bengaluru'
                      : 'e.g., The Green Table, Indiranagar'
                  }
                  autoComplete="organization"
                  className="field"
                />
              </div>
            </div>}

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-clay/20 bg-clay/[0.06] px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-clay"
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {notice && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-moss/20 bg-moss/[0.06] px-3.5 py-3 text-[11px] font-semibold text-moss">
                <Check size={14} className="mt-0.5 shrink-0" />
                {notice}
              </div>
            )}

            <button type="submit" className="btn-primary mt-5 w-full py-3.5 text-xs">
              {submitLabel}
              <ArrowRight size={15} />
            </button>

            <p className="mt-3 text-center text-[9px] font-semibold text-ink/35">{backendConfigured ? 'Your account works across devices.' : 'Accounts are stored in this browser.'}</p>
            <p className="mt-2 text-center text-[9px] text-forest/45">Administrator sign-in uses the email <strong>superadmin@admin.in</strong>.</p>
          </form>

          <p className="mt-5 text-center text-[11px] text-ink/45">
            {mode === 'register' ? 'Already have an account?' : 'New here?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }} className="font-bold text-forest underline">
              {mode === 'register' ? 'Sign in' : 'Create account'}
            </button>
          </p>
          <p className="mt-4 rounded-2xl bg-cream/70 p-4 text-center text-[10px] leading-relaxed text-ink/45">{backendConfigured ? 'Your account and NourishBridge activity are shared across devices. Passwords are handled by the secure sign-in service.' : 'Accounts are stored in this browser and do not sync across devices. Passwords are saved as salted hashes.'}</p>

          <p className="mt-5 text-center text-[10px] text-ink/35">
            Just browsing?{' '}
            <button
              type="button"
              onClick={() => navigate('feed')}
              className="font-bold text-forest underline decoration-saffron decoration-2 underline-offset-2 transition hover:text-clay"
            >
              Explore the live feed
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}




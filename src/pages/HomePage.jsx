import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  HeartHandshake,
  MapPin,
  PhoneOff,
  PlusCircle,
  Quote,
  Radio,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import CountUp from '../components/CountUp'
import Reveal from '../components/Reveal'
import SmartImage from '../components/SmartImage'
import { useFood } from '../context/FoodContext'
import { IMAGES } from '../data/seedData'
import { initials, timeAgo } from '../utils/helpers'

const CRISIS_CARDS = [
  {
    icon: Trash2,
    label: 'The surplus',
    stat: '1.05B tonnes',
    copy: 'of edible food is wasted globally every year — from banquet halls, restaurants, grocers and homes.',
    source: 'UNEP Food Waste Index 2024',
  },
  {
    icon: Users,
    label: 'The need',
    stat: '733M people',
    copy: 'faced hunger in 2023. Many live minutes away from food that is thrown away the same evening.',
    source: 'FAO State of Food Security 2024',
  },
]

const STEPS = [
  {
    number: '01',
    icon: Store,
    kicker: 'A donor',
    title: 'Shares what’s left.',
    copy: 'A restaurant, banquet hall, bakery or home lists the food, quantity, pickup window and location in under a minute.',
    chips: ['Restaurants', 'Events', 'Homes'],
  },
  {
    number: '02',
    icon: Radio,
    kicker: 'The live feed',
    title: 'Finds the nearest plate.',
    copy: 'An administrator reviews each donation before it appears. Receivers then request food, and approved requests move to pickup.',
    chips: ['Live status', 'Local first'],
  },
  {
    number: '03',
    icon: HeartHandshake,
    kicker: 'A receiver',
    title: 'Carries it home.',
    copy: 'A self receiver requests food directly. A distributor can pick it up and deliver to elderly, homeless or offline neighbours.',
    chips: ['Self receiver', 'Distributor'],
  },
]

const BRIDGE_POINTS = [
  {
    icon: PhoneOff,
    title: 'No smartphone needed',
    copy: 'Offline neighbours are reached through a trusted human, not an app.',
  },
  {
    icon: Truck,
    title: 'Pickup to doorstep',
    copy: 'Distributors collect surplus and carry it the last mile.',
  },
  {
    icon: HeartHandshake,
    title: 'One claim, many plates',
    copy: 'A single listing can feed a shelter, an elder-care home or a whole street.',
  },
]

function ImpactTile({ icon: Icon, value, label, index }) {
  return (
    <div className="bg-forest-deep p-5 transition duration-300 hover:bg-forest sm:p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-cream/10 bg-cream/5 text-saffron">
          <Icon size={14} strokeWidth={1.9} />
        </span>
        <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-cream/25">
          0{index + 1}
        </span>
      </div>
      <p className="mt-7 font-display text-[2.4rem] font-medium leading-none tracking-[-0.03em] text-cream sm:text-[2.9rem]">
        <CountUp value={value} />
      </p>
      <p className="mt-2.5 text-[8.5px] font-extrabold uppercase tracking-[0.15em] text-cream/45">
        {label}
      </p>
    </div>
  )
}

function PreviewCard({ post, navigate }) {
  return (
    <button
      type="button"
      onClick={() => navigate('feed')}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-forest/10 bg-white text-left shadow-card transition duration-500 hover:-translate-y-1 hover:border-forest/20 hover:shadow-lift"
    >
      <div className="relative">
        <SmartImage
          src={post.imageUrl}
          alt={post.title}
          className="h-48 w-full"
          imgClassName="transition duration-700 group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/30 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-forest px-2.5 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.11em] text-cream shadow-sm">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-saffron" />
          Available now
        </span>
        <span className="absolute right-3 top-3 max-w-[55%] truncate rounded-full bg-white/85 px-2.5 py-1.5 text-[7.5px] font-extrabold uppercase tracking-[0.1em] text-forest/65 shadow-sm backdrop-blur">
          {post.foodCategory}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-[8px] font-extrabold uppercase tracking-[0.12em]">
          <span className="truncate text-forest/50">{post.donorName}</span>
          <span className="shrink-0 text-ink/30">{timeAgo(post.createdAt)}</span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 font-display text-[1.3rem] font-medium leading-[1.2] text-forest-deep">
          {post.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-forest/10 pt-4 text-[10px] font-bold text-ink/45">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin size={11} className="shrink-0 text-moss" />
            <span className="truncate">{post.location.split(',')[0]}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-forest transition group-hover:gap-2">
            View listing
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </button>
  )
}

export default function HomePage({ navigate }) {
  const { posts, stats, currentUser } = useFood()

  const availablePosts = posts.filter((post) => post.status === 'available')
  const featuredPosts = [...availablePosts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
  const heroPost = featuredPosts[0] || posts[0]

  const startCta = currentUser ? 'Continue to live feed' : 'Get started / login'

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(circle_at_78%_8%,#f8e6c4_0%,transparent_46%)]" />
        <div className="dot-grid-dark pointer-events-none absolute -left-10 top-28 -z-10 h-52 w-52 rounded-full opacity-40" />
        <div className="pointer-events-none absolute -right-24 top-72 -z-10 h-72 w-72 rounded-full bg-saffron/10 blur-3xl" />

        <div className="shell relative grid items-center gap-16 pb-24 pt-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:pb-32 lg:pt-20">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
                </span>
                A live bridge between surplus & need
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 max-w-[13ch] font-display text-[clamp(2.9rem,6.1vw,5.2rem)] font-medium leading-[0.94] tracking-[-0.045em] text-forest-deep">
                The food is here.
                <span className="mt-1 block italic text-clay">The need is too.</span>
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-ink/60 sm:text-lg">
                Every day, kitchens, banquet halls and homes discard meals that
                could feed a neighbourhood. NourishBridge connects that surplus
                to people who can claim it — and to distributors who carry it to
                those who can’t.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(currentUser ? 'feed' : 'login')}
                  className="btn-primary group px-7 py-4 text-sm"
                >
                  {startCta}
                  <ArrowRight
                    size={16}
                    className="transition duration-300 group-hover:translate-x-1"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('feed')}
                  className="btn-secondary px-7 py-4 text-sm"
                >
                  <Radio size={15} className="text-clay" />
                  Explore live food feed
                </button>
              </div>
            </Reveal>

            <Reveal delay={290}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10.5px] font-semibold text-forest/55">
                <span className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-moss/10 text-moss">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  Free for donors, receivers & distributors
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-moss" />
                  Sign in to share or claim food
                </span>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-forest/10 pt-6">
                {[
                  { value: stats.mealsRescued, label: 'meals rescued' },
                  { value: stats.activeDonations, label: 'live donations' },
                  { value: stats.communityDistributors, label: 'distributors' },
                ].map((item) => (
                  <div key={item.label} className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-semibold tracking-tight text-forest">
                      <CountUp value={item.value} />
                    </span>
                    <span className="text-[8.5px] font-extrabold uppercase tracking-[0.13em] text-forest/40">
                      {item.label}
                    </span>
                  </div>
                ))}
                <span className="text-[9px] font-bold text-forest/30">
                  meals shared here
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={180} className="relative mx-auto w-full max-w-[32rem] pb-8 lg:max-w-none">
            <div className="pointer-events-none absolute -inset-3 rotate-2 rounded-[3rem] border border-forest/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-saffron/20 blur-3xl" />

            <div className="relative">
              <SmartImage
                src={IMAGES.hero}
                alt="Volunteers unloading boxes of rescued food from a truck"
                loading="eager"
                className="aspect-[4/4.35] w-full rounded-[2.6rem] shadow-soft sm:aspect-[4/4.1]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[2.6rem] bg-gradient-to-t from-forest-deep/45 via-transparent to-forest-deep/5" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-cream/95 px-3.5 py-2 text-[8px] font-extrabold uppercase tracking-[0.14em] text-forest shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-clay" />
                </span>
                Live feed · Bengaluru
              </div>

              <div className="absolute -right-3 top-24 hidden animate-float-slow items-center gap-2.5 rounded-2xl border border-white/50 bg-saffron px-3.5 py-2.5 text-forest-deep shadow-lift sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-deep/10">
                  <HeartHandshake size={16} />
                </span>
                <div>
                  <p className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-forest-deep/55">
                    The human bridge
                  </p>
                  <p className="text-[10px] font-extrabold">Distributors deliver</p>
                </div>
              </div>

              <div className="absolute -left-2 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[7px] font-extrabold uppercase tracking-[0.28em] text-cream/60 lg:block">
                Rescue · Share · Repeat
              </div>

              {heroPost && (
                <div className="absolute -bottom-7 left-4 right-4 rounded-[1.4rem] border border-white/60 bg-cream/96 p-3.5 shadow-soft backdrop-blur sm:left-6 sm:right-auto sm:w-[21rem]">
                  <div className="flex items-center gap-3">
                    <SmartImage
                      src={heroPost.imageUrl}
                      alt={heroPost.title}
                      className="h-14 w-14 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[7.5px] font-extrabold uppercase tracking-[0.14em] text-clay">
                          Available now
                        </span>
                        <span className="text-[8px] font-bold text-forest/35">
                          {timeAgo(heroPost.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11.5px] font-extrabold text-forest">
                        {heroPost.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[9px] text-ink/45">
                        <MapPin size={9} />
                        {heroPost.quantity} · {heroPost.location.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('feed')}
                    className="mt-3 flex w-full items-center justify-between rounded-full bg-forest px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-cream transition hover:bg-forest-deep"
                  >
                    View on the live feed
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-y border-forest/10 bg-white/45">
        <div className="shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0 text-[8px] font-extrabold uppercase tracking-[0.2em] text-forest/35">
            Surplus comes from
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold text-forest/55">
            {[
              'Restaurants',
              'Banquet halls',
              'Bakeries',
              'Households',
              'Campus kitchens',
              'Grocery stores',
            ].map((item, index) => (
              <span key={item} className="flex items-center gap-5">
                {item}
                {index < 5 && (
                  <span className="h-1 w-1 rounded-full bg-saffron/70" />
                )}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('feed')}
            className="link-arrow shrink-0 text-[10px]"
          >
            See what’s live
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Crisis & digital divide */}
      <section id="why" className="relative scroll-mt-24 py-20 lg:py-28">
        <div className="shell">
          <Reveal className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <span className="eyebrow">
                <Sparkles size={12} className="text-clay" />
                The paradox on our plates
              </span>
              <h2 className="mt-5 max-w-xl font-display text-[clamp(2.3rem,4.2vw,3.7rem)] font-medium leading-[1.02] tracking-[-0.035em] text-forest-deep">
                A tale of two realities,
                <span className="italic text-clay"> on the same street.</span>
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-ink/55 sm:text-base lg:justify-self-end">
              On one side, edible food is thrown away because the event ended or
              the kitchen closed. On the other, a neighbour goes to sleep hungry.
              The distance between them is rarely miles — it’s a missing
              connection, and sometimes a missing smartphone.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            {CRISIS_CARDS.map((card, index) => {
              const Icon = card.icon
              return (
                <Reveal
                  key={card.label}
                  delay={index * 90}
                  className="lg:col-span-4"
                >
                  <div className="flex h-full flex-col rounded-[1.75rem] border border-forest/10 bg-white p-6 shadow-card sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest/5 text-forest">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-forest/35">
                        {card.label}
                      </span>
                    </div>
                    <p className="mt-8 font-display text-[2.5rem] font-medium leading-none tracking-[-0.035em] text-forest-deep">
                      {card.stat}
                    </p>
                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ink/55">
                      {card.copy}
                    </p>
                    <p className="mt-5 border-t border-forest/10 pt-3 text-[8px] font-bold uppercase tracking-[0.1em] text-ink/30">
                      {card.source}
                    </p>
                  </div>
                </Reveal>
              )
            })}

            <Reveal delay={180} className="lg:col-span-4">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-forest p-6 text-cream shadow-soft sm:p-7">
                <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-30" />
                <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-saffron/15 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cream/15 bg-cream/5 text-saffron">
                      <PhoneOff size={18} strokeWidth={1.8} />
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-cream/35">
                      The digital divide
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-[2rem] font-medium leading-[1.05] tracking-[-0.025em] text-cream">
                    Not everyone can tap ‘claim’.
                  </h3>
                  <p className="mt-3 flex-1 text-[13px] leading-relaxed text-cream/60">
                    Elderly, homeless and offline neighbours are often invisible
                    to app-only platforms. Distributors are the human bridge —
                    they pick up surplus and deliver it to the people no
                    notification can reach.
                  </p>

                  <div className="mt-6 flex items-center gap-2">
                    {[PhoneOff, Truck, HeartHandshake].map((Icon, index) => (
                      <div key={index} className="flex flex-1 items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cream/15 bg-cream/5 text-cream/70">
                          <Icon size={13} />
                        </span>
                        {index < 2 && (
                          <span className="h-px flex-1 border-t border-dashed border-cream/25" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[6.5px] font-extrabold uppercase tracking-[0.12em] text-cream/35">
                    <span>Offline neighbour</span>
                    <span>Distributor</span>
                    <span>Meal delivered</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('login')}
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-saffron transition hover:gap-3 hover:text-cream"
                  >
                    Become a distributor
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>

          <p className="mt-5 text-[9px] leading-relaxed text-ink/30">
            Global figures: UNEP Food Waste Index 2024 and FAO State of Food
            Security and Nutrition in the World 2024. NourishBridge is starting
            in Bengaluru.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative scroll-mt-24 overflow-hidden border-y border-forest/10 bg-parchment/65 py-20 lg:py-28"
      >
        <div className="dot-grid-dark pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-30" />
        <div className="shell relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              How the bridge works
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.3rem,4.2vw,3.7rem)] font-medium leading-[1.02] tracking-[-0.035em] text-forest-deep">
              From surplus to a shared meal,
              <span className="italic text-clay"> in three steps.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink/55 sm:text-base">
              No cold chain, no paperwork. Just a live listing and a neighbour —
              or a distributor — ready to carry it the last mile.
            </p>
          </Reveal>

          <div className="relative mt-14">
            <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[3.25rem] hidden border-t border-dashed border-forest/20 lg:block" />
            <div className="grid gap-4 lg:grid-cols-3">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <Reveal key={step.number} delay={index * 100}>
                    <div className="relative flex h-full flex-col rounded-[1.75rem] border border-forest/10 bg-cream p-6 shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                      <div className="flex items-start justify-between">
                        <span className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream shadow-lift">
                          <Icon size={20} strokeWidth={1.8} />
                        </span>
                        <span className="font-display text-[2.6rem] font-medium italic leading-none text-forest/12">
                          {step.number}
                        </span>
                      </div>
                      <p className="mt-7 text-[8px] font-extrabold uppercase tracking-[0.18em] text-clay">
                        {step.kicker}
                      </p>
                      <h3 className="mt-2 font-display text-[1.55rem] font-medium leading-tight tracking-[-0.02em] text-forest-deep">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink/55">
                        {step.copy}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {step.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-forest/10 bg-white/70 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-forest/50"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>

          <Reveal delay={160} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('create-post')}
              className="btn-primary px-6 py-3.5 text-xs"
            >
              <PlusCircle size={15} />
              Post surplus food
            </button>
            <button
              type="button"
              onClick={() => navigate('feed')}
              className="btn-secondary px-6 py-3.5 text-xs"
            >
              See what’s available
              <ArrowRight size={14} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* Live impact */}
      <section id="impact" className="scroll-mt-24 py-20 lg:py-24">
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-deep px-6 py-12 text-cream shadow-soft sm:px-10 lg:px-14 lg:py-16">
              <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-25" />
              <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-saffron/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-moss/15 blur-3xl" />

              <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-saffron">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron/50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
                    </span>
                    Live impact preview
                  </span>
                  <h2 className="mt-5 font-display text-[clamp(2.3rem,4.2vw,3.7rem)] font-medium leading-[1.01] tracking-[-0.035em] text-cream">
                    Small acts.
                    <span className="block italic text-saffron">Real numbers.</span>
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/55">
                    These counters update as neighbours share and claim food. Claim a
                    meal, post surplus or mark a delivery — and watch them move.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('feed')}
                    className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-saffron transition hover:gap-3 hover:text-cream"
                  >
                    Open the live feed
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10">
                  <ImpactTile
                    icon={UtensilsCrossed}
                    value={stats.mealsRescued}
                    label="Meals rescued"
                    index={0}
                  />
                  <ImpactTile
                    icon={Radio}
                    value={stats.activeDonations}
                    label="Active donations"
                    index={1}
                  />
                  <ImpactTile
                    icon={Truck}
                    value={stats.communityDistributors}
                    label="Community distributors"
                    index={2}
                  />
                  <ImpactTile
                    icon={Store}
                    value={stats.donors}
                    label="Donors on board"
                    index={3}
                  />
                </div>
              </div>

              <div className="relative mt-10 flex flex-col gap-2 border-t border-cream/10 pt-5 text-[8.5px] font-bold uppercase tracking-[0.13em] text-cream/35 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-saffron" />
                  Updated live from {stats.totalDonations} community listings
                </span>
                <span>
                  {stats.mealsInMotion.toLocaleString('en-IN')} meals currently
                  in motion
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Live feed preview */}
      <section id="live-preview" className="scroll-mt-24 pb-20 lg:pb-28">
        <div className="shell">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-clay" />
                </span>
                Right now on the bridge
              </span>
              <h2 className="mt-4 max-w-xl font-display text-[clamp(2.2rem,3.8vw,3.3rem)] font-medium leading-[1.03] tracking-[-0.035em] text-forest-deep">
                Fresh surplus, waiting for
                <span className="italic text-clay"> a second life.</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('feed')}
              className="link-arrow shrink-0 pb-1 text-xs"
            >
              See all {stats.activeDonations} live donations
              <ArrowRight size={14} />
            </button>
          </Reveal>

          {featuredPosts.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featuredPosts.map((post, index) => (
                <Reveal key={post.id} delay={index * 80} className="h-full">
                  <PreviewCard post={post} navigate={navigate} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-forest/20 bg-white/50 p-10 text-center">
              <Sparkles size={24} className="mx-auto text-clay" />
              <h3 className="mt-3 font-display text-2xl text-forest-deep">
                The feed is quiet right now.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/50">
                Every meal has found a home. Post surplus to start the bridge
                again.
              </p>
              <button
                type="button"
                onClick={() => navigate('create-post')}
                className="btn-primary mt-5 px-5 py-3 text-xs"
              >
                <PlusCircle size={14} />
                Post surplus
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-forest/15 bg-white/40 px-4 py-3.5 text-[10.5px] leading-relaxed text-ink/45 sm:flex-row sm:items-center">
            <HeartHandshake size={16} className="shrink-0 text-clay" />
            Every listing is posted by a donor and claimed by a self receiver or
            a community distributor. The loop closes when the meal is delivered.
          </div>
        </div>
      </section>

      {/* Human bridge quote */}
      <section className="pb-20 lg:pb-28">
        <div className="shell grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-saffron p-7 text-forest-deep sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-12 -top-10 h-56 w-56 rounded-full border-[28px] border-forest-deep/5" />
              <Quote size={30} className="text-forest-deep/25" />
              <blockquote className="mt-6 max-w-xl font-display text-[clamp(1.65rem,2.7vw,2.4rem)] font-medium leading-[1.16] tracking-[-0.025em]">
                “My mother can’t use a smartphone. The distributor network means
                she still gets a hot meal — and I get to stop worrying.”
              </blockquote>
              <div className="mt-auto flex items-center gap-3 pt-8">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-deep text-[10px] font-extrabold text-cream">
                  {initials('Priya N.')}
                </span>
                <div>
                  <p className="text-xs font-extrabold">Priya N.</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-forest-deep/50">
                    Daughter of a beneficiary · Bengaluru
                  </p>
                </div>
                <span className="ml-auto hidden rounded-full border border-forest-deep/15 px-3 py-1 text-[7px] font-extrabold uppercase tracking-[0.12em] text-forest-deep/40 sm:block">
                  Illustrative story
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-card sm:p-9">
              <span className="eyebrow w-fit">
                <HeartHandshake size={12} className="text-clay" />
                The human bridge
              </span>
              <h2 className="mt-4 font-display text-[clamp(1.9rem,3vw,2.5rem)] font-medium leading-[1.06] tracking-[-0.03em] text-forest-deep">
                For the people an app can’t reach.
              </h2>
              <div className="mt-6 space-y-4">
                {BRIDGE_POINTS.map((point) => {
                  const Icon = point.icon
                  return (
                    <div key={point.title} className="flex gap-3.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest/5 text-forest">
                        <Icon size={16} strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-forest">
                          {point.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink/50">
                          {point.copy}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="btn-primary mt-auto w-full py-3.5 text-xs"
              >
                <Truck size={15} />
                Join as a distributor
                <ArrowRight size={14} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20 lg:pb-24">
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-forest px-6 py-12 text-cream shadow-soft sm:px-10 lg:px-16 lg:py-16">
              <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-30" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-saffron/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-moss/20 blur-3xl" />

              <div className="relative max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-saffron">
                  <HeartHandshake size={12} />
                  Be the bridge
                </span>
                <h2 className="mt-5 font-display text-[clamp(2.4rem,4.8vw,4.1rem)] font-medium leading-[0.98] tracking-[-0.04em] text-cream">
                  One post. One pickup.
                  <span className="block italic text-saffron">
                    One fewer empty plate.
                  </span>
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/55 sm:text-base">
                  Whether you have a tray of surplus or an hour to deliver it,
                  you’re one connection away from turning waste into a warm
                  meal.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate(currentUser ? 'feed' : 'login')}
                    className="btn-saffron group px-7 py-4 text-sm"
                  >
                    {startCta}
                    <ArrowRight
                      size={16}
                      className="transition duration-300 group-hover:translate-x-1"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('create-post')}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-7 py-4 text-sm font-bold text-cream transition duration-300 hover:-translate-y-0.5 hover:border-cream/35 hover:bg-cream/10"
                  >
                    <PlusCircle size={15} />
                    Post surplus food
                  </button>
                </div>
                <p className="mt-5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-cream/30">
                  <Clock size={11} />
                  Takes under a minute · Your account stays on this device
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}

import {
  ArrowRight,
  Check,
  Clock,
  Lock,
  LogIn,
  MessageCircle,
  MapPin,
  PackageCheck,
  Truck,
  Utensils,
} from 'lucide-react'
import SmartImage from './SmartImage'
import { initials, timeAgo } from '../utils/helpers'

const STATUS_META = {
  pending: {
    label: 'Awaiting approval',
    badge: 'bg-saffron text-forest-deep',
    dot: 'bg-forest',
  },
  available: {
    label: 'Available now',
    badge: 'bg-forest text-cream',
    dot: 'bg-saffron',
  },
  claimed: {
    label: 'Claimed',
    badge: 'bg-saffron text-forest-deep',
    dot: 'bg-forest',
  },
  'claim-pending': {
    label: 'Request under review',
    badge: 'bg-saffron text-forest-deep',
    dot: 'bg-forest',
  },
  rejected: {
    label: 'Not approved',
    badge: 'bg-white/90 text-clay ring-1 ring-clay/15',
    dot: 'bg-clay',
  },
  delivered: {
    label: 'Approved · closed',
    badge: 'bg-white/90 text-forest ring-1 ring-forest/10',
    dot: 'bg-moss',
  },
}

export default function FoodCard({
  post,
  currentUser,
  onClaim,
  onDeliver,
  onLogin,
}) {
  const status = STATUS_META[post.status] || STATUS_META.available
  const canDeliver = post.status === 'claimed' && (
    (currentUser?.id && post.donorId === currentUser.id) ||
    (currentUser?.id && post.claimedById === currentUser.id) ||
    (!currentUser?.id && currentUser?.role === 'donor' && currentUser.name === post.donorName) ||
    (!currentUser?.id && currentUser?.role === 'receiver' && currentUser.name === post.claimedBy)
  )
  const whatsappNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    return digits.length === 10 ? `91${digits}` : digits
  }
  const foodDetails = `Food: ${post.title}\nQuantity: ${post.quantity}\nCategory: ${post.foodCategory}\nPickup location: ${post.location}\nPickup window: ${post.expiresIn}\nDetails: ${post.description || 'No extra details provided.'}\nReceiver note: ${post.beneficiaryNote || 'None'}`
  const donorOwnsPost = currentUser?.id ? post.donorId === currentUser.id : currentUser?.email === post.donorEmail
  const receiverClaimedPost = currentUser?.id ? post.claimedById === currentUser.id : currentUser?.email === post.claimedEmail
  const messageTarget = currentUser?.role === 'donor' && donorOwnsPost
    ? { phone: post.whatsappPhone || post.claimedPhone, name: post.whatsappName || post.claimedBy, text: `Hello ${post.whatsappName || post.claimedBy || 'there'}, your NourishBridge request was approved. Let us coordinate pickup.\n\n${foodDetails}` }
    : currentUser?.role === 'receiver' && receiverClaimedPost
      ? { phone: post.whatsappPhone || post.donorPhone, name: post.whatsappName || post.donorName, text: `Hello ${post.whatsappName || post.donorName || 'there'}, my NourishBridge request was approved. Let us coordinate pickup.\n\n${foodDetails}` }
      : null
  const whatsappUrl = messageTarget && whatsappNumber(messageTarget.phone)
    ? `https://wa.me/${whatsappNumber(messageTarget.phone)}?text=${encodeURIComponent(messageTarget.text)}`
    : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-forest/10 bg-white shadow-card transition duration-500 hover:-translate-y-1 hover:border-forest/20 hover:shadow-lift">
      <div className="relative">
        <SmartImage
          src={post.imageUrl}
          alt={post.title}
          className="h-52 w-full"
          imgClassName="transition duration-700 group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/35 via-transparent to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.11em] shadow-sm backdrop-blur ${status.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status.dot} ${
                post.status === 'available' ? 'animate-pulse-soft' : ''
              }`}
            />
            {status.label}
          </span>
          <span className="max-w-[52%] truncate rounded-full bg-white/85 px-2.5 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.1em] text-forest/70 shadow-sm backdrop-blur">
            {post.foodCategory}
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-cream">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cream/85">
            <span className="h-1 w-1 rounded-full bg-saffron" />
            {post.donorType}
          </span>
          <span className="rounded-full bg-forest-deep/45 px-2 py-1 text-[9px] font-bold text-cream/80 backdrop-blur">
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[9px] font-extrabold ${
              post.donorType === 'Household'
                ? 'bg-saffron-light text-clay'
                : 'bg-forest/[0.08] text-forest'
            }`}
          >
            {initials(post.donorName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-forest">
              {post.donorName}
            </p>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-forest/40">
              Verified donor · {post.donorType}
            </p>
          </div>
        </div>

        <h3 className="mt-4 line-clamp-2 font-display text-[1.35rem] font-medium leading-[1.18] tracking-[-0.01em] text-forest-deep">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink/55">
          {post.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10.5px] font-semibold text-ink/55">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 text-moss" />
            <span className="line-clamp-1">{post.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Utensils size={12} className="shrink-0 text-moss" />
            {post.quantity}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-moss" />
            <span className="line-clamp-1">{post.expiresIn}</span>
          </span>
        </div>

        {['claim-pending', 'claimed', 'delivered'].includes(post.status) && (
          <div className="mt-4 rounded-2xl border border-forest/10 bg-parchment/55 px-3.5 py-3">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-bold text-forest">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-forest">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>
                {post.status === 'delivered' ? 'Approved for' : post.status === 'claim-pending' ? 'Requested by' : 'Claimed by'}{' '}
                {post.claimedBy}
              </span>
              <span className="rounded-full bg-forest/[0.08] px-2 py-0.5 text-[7.5px] font-extrabold uppercase tracking-[0.1em] text-forest/55">
                {post.claimedSubRole === 'distributor'
                  ? 'Distributor'
                  : 'Self receiver'}
              </span>
            </div>
            {post.beneficiaryNote && (
              <p className="mt-2 border-t border-forest/10 pt-2 text-[10.5px] italic leading-relaxed text-ink/50">
                “{post.beneficiaryNote}”
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-5">
          {post.status === 'available' && (
            <>
              {currentUser?.role === 'receiver' && (
                <button
                  type="button"
                  onClick={() => onClaim(post)}
                  className="btn-primary w-full py-3 text-xs"
                >
                  Claim this food
                  <ArrowRight size={14} />
                </button>
              )}
              {!currentUser && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="btn-secondary w-full py-3 text-xs"
                >
                  <LogIn size={14} />
                  Log in to claim
                </button>
              )}
              {currentUser?.role === 'donor' && (
                <div className="flex items-center justify-center gap-2 rounded-full border border-dashed border-forest/15 bg-parchment/35 py-3 text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-forest/40">
                  <Lock size={12} />
                  Receivers claim from the feed
                </div>
              )}
            </>
          )}

          {post.status === 'claimed' &&
            (canDeliver ? (
              <button
                type="button"
                onClick={() => onDeliver(post.id)}
                className="btn-saffron w-full py-3 text-xs"
              >
                <PackageCheck size={14} />
                Mark as delivered
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-full bg-forest/5 py-3 text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-forest/50">
                <Truck size={13} />
                Delivery in progress
              </div>
            ))}

          {post.status === 'claim-pending' && (
            <div className="flex items-center justify-center gap-2 rounded-full bg-saffron-light/70 py-3 text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-clay">
              <Clock size={13} /> Awaiting administrator approval
            </div>
          )}

          {post.status === 'delivered' && (
            <div>
              <div className="flex items-center justify-center gap-2 rounded-full bg-moss/[0.08] py-3 text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-moss">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-moss text-cream"><Check size={10} strokeWidth={3} /></span>
                Approved · coordinate pickup
              </div>
              {messageTarget && (whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-3 w-full py-3 text-xs"><MessageCircle size={14} />Message {messageTarget.name} on WhatsApp</a> : <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-center text-[10px] text-ink/50">Add a WhatsApp number to your account to contact {messageTarget.name}.</p>)}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

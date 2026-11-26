import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Smartphone,
  Truck,
  X,
} from 'lucide-react'
import SmartImage from './SmartImage'
import { initials, roleLabel } from '../utils/helpers'

export default function ClaimModal({ post, currentUser, onClose, onConfirm }) {
  const [note, setNote] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 150)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [onClose])

  if (!post || !currentUser) return null

  const isDistributor = currentUser.subRole === 'distributor'

  const handleSubmit = (event) => {
    event.preventDefault()
    onConfirm(post.id, currentUser.name, currentUser.subRole || 'self', note)
  }

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-forest-deep/65 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="modal-panel max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border border-forest/10 bg-cream shadow-soft sm:rounded-[2rem]"
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Claim donation</p>
              <h2
                id="claim-modal-title"
                className="mt-3 font-display text-[1.8rem] font-medium leading-[1.1] tracking-[-0.02em] text-forest-deep"
              >
                Bring this food to a plate.
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-forest/10 bg-white/70 text-forest/55 transition hover:bg-white hover:text-forest"
              aria-label="Close claim dialog"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-forest/10 bg-white/70 p-3">
            <SmartImage
              src={post.imageUrl}
              alt={post.title}
              className="h-16 w-16 shrink-0 rounded-xl"
            />
            <div className="min-w-0 py-0.5">
              <p className="line-clamp-1 text-sm font-extrabold text-forest">
                {post.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-ink/50">
                {post.quantity} · {post.donorName}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-ink/40">
                <MapPin size={10} />
                {post.location}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-forest/10 bg-white/55 p-3.5">
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                isDistributor
                  ? 'bg-forest text-cream'
                  : 'bg-saffron text-forest-deep'
              }`}
            >
              {initials(currentUser.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-forest">
                {currentUser.name}
              </p>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-forest/45">
                {roleLabel(currentUser)}
                {currentUser.organizationOrArea
                  ? ` · ${currentUser.organizationOrArea}`
                  : ''}
              </p>
            </div>
          </div>

          {isDistributor ? (
            <div className="mt-4 flex gap-3 rounded-2xl bg-forest p-4 text-cream">
              <Truck size={18} className="mt-0.5 shrink-0 text-saffron" />
              <p className="text-[11.5px] leading-relaxed text-cream/75">
                <span className="font-extrabold text-cream">
                  You’re the human bridge.
                </span>{' '}
                Add delivery details below so the donor knows where this food
                will land — and who it reaches offline.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex gap-3 rounded-2xl border border-forest/10 bg-saffron-light/45 p-4 text-forest">
              <Smartphone size={18} className="mt-0.5 shrink-0 text-clay" />
              <p className="text-[11.5px] leading-relaxed text-forest/65">
                <span className="font-extrabold text-forest">
                  Claiming for yourself.
                </span>{' '}
                The donor will see your name. You can add a short note about who
                this meal is for.
              </p>
            </div>
          )}

          <label
            htmlFor="beneficiary-note"
            className="label mt-5 flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <HeartHandshake size={13} className="text-clay" />
              {isDistributor ? 'Where is this meal going?' : 'Who is this meal for?'}
            </span>
            <span className="font-bold normal-case tracking-normal text-ink/30">
              Optional
            </span>
          </label>
          <textarea
            id="beneficiary-note"
            ref={textareaRef}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={240}
            placeholder={
              isDistributor
                ? 'e.g., Delivering 80 boxes to Sunrise Elder Care and two night shelters.'
                : 'e.g., For my family of four and two neighbours.'
            }
            className="field resize-none"
          />
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink/35">
            <span>Shared with the donor to close the loop.</span>
            <span>{note.length}/240</span>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 py-3 text-xs">
              Confirm claim
              <ArrowRight size={14} />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-ink/35">
            Coordinate pickup details directly with the donor.
          </p>
        </form>
      </div>
    </div>,
    document.body,
  )
}

import { useEffect, useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

export default function SmartImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  loading = 'lazy',
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div className={`relative overflow-hidden bg-parchment ${className}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#f8e6c4,#f3ebde_70%)]">
          <div className="grid place-items-center gap-2 text-forest/35">
            <UtensilsCrossed size={26} strokeWidth={1.6} />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
              NourishBridge
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

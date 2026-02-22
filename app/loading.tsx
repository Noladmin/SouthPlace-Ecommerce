import Image from "next/image"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl" style={{background: 'radial-gradient(ellipse at center, rgba(40,40,40,0.95) 0%, rgba(20,20,20,0.95) 100%)'}}>
      <div className="flex flex-col items-center gap-10 animate-fade-in-scale">
        <div className="relative flex flex-col items-center justify-center">
          {/* Enhanced spinner ring with glow */}
          <span className="absolute w-48 h-48 rounded-full border-8 border-t-primary border-b-secondary border-l-white/40 border-r-white/40 shadow-2xl shadow-primary/30 animate-spin-slow"></span>
          {/* Logo with glow */}
          <Image
            src="/images/SouthLogo.png"
            alt="South Place Catering Logo"
            width={170}
            height={170}
            className="drop-shadow-[0_0_32px_rgba(232,73,40,0.5)] rounded-full bg-white/10 p-2"
            priority
          />
          {/* Progress bar with shimmer */}
          <div className="relative w-40 h-2 mt-8 rounded-full overflow-hidden bg-white/20">
            <div className="absolute inset-0 animate-progress-bar bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto]"></div>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <span className="text-white text-3xl font-extrabold tracking-wide animate-shimmer bg-gradient-to-r from-white via-primary to-secondary bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            Loading
          </span>
          <span className="ml-2 flex">
            <span className="dot dot1">.</span>
            <span className="dot dot2">.</span>
            <span className="dot dot3">.</span>
          </span>
        </div>
      </div>
    </div>
  )
} 

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  description?: string;
  className?: string;
}

export default function SectionTitle({ children, subtitle, description, className = '' }: SectionTitleProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {subtitle && (
        <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-3">
          {subtitle}
        </p>
      )}
      
      <h2 className="relative inline-block text-4xl md:text-5xl font-bold mb-4">
        {/* Brush stroke behind title */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[150%] -z-10 pointer-events-none"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10,50 Q50,20 100,40 T200,50 T300,45 Q350,55 390,50"
            fill="none"
            stroke="#111827"
            strokeWidth="60"
            strokeLinecap="round"
            opacity="0.08"
          />
        </svg>
        {children}
      </h2>
      
      {description && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}


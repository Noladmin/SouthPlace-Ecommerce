interface BrushStrokeProps {
  children: React.ReactNode;
  className?: string;
}

export default function BrushStroke({ children, className = '' }: BrushStrokeProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Brush stroke SVG behind text */}
      <svg
        className="absolute left-0 right-0 bottom-0 w-full h-3 md:h-4 -z-10"
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,5 Q10,2 20,5 T40,5 T60,5 T80,5 T100,5 T120,5 T140,5 T160,5 T180,5 Q190,8 200,5"
          fill="none"
          stroke="#f97316"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
      {children}
    </span>
  );
}


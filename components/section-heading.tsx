interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{title}</h2>
      {subtitle && <p className="text-lg text-gray-700">{subtitle}</p>}
      <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
    </div>
  )
}

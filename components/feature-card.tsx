import { Utensils, Package, Briefcase, ChefHat } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "utensils":
        return <Utensils className="h-8 w-8 text-primary" />
      case "bowl-food":
        return <Package className="h-8 w-8 text-primary" />
      case "briefcase":
        return <Briefcase className="h-8 w-8 text-primary" />
      case "chef-hat":
        return <ChefHat className="h-8 w-8 text-primary" />
      default:
        return <Utensils className="h-8 w-8 text-primary" />
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">{getIcon()}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  )
}

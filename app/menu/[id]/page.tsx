import { notFound } from "next/navigation"
import MenuItemDetailClient from "@/components/menu-item-detail-client"
import { getPublicMenuData } from "@/lib/menu-data"

interface MenuItemPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { id } = await params
  const menuCategories = await getPublicMenuData()
  const category = menuCategories.find((menuCategory) => menuCategory.items.some((item) => item.id === id))
  const item = category?.items.find((menuItem) => menuItem.id === id)

  if (!item) {
    notFound()
  }

  return <MenuItemDetailClient item={item} categoryName={category?.name} />
}

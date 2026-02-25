import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { Category, Domain } from '../store/categoriesSlice'

interface UseDomainSearchResult {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredCategories: Category[]
  filteredFavoriteDomains: Domain[]
  filteredUserFavoriteDomains: Domain[]
}

export function filterBySearch(
  categories: Category[],
  favoriteDomains: Domain[],
  userFavoriteDomains: Domain[],
  query: string
): { filteredCategories: Category[]; filteredFavoriteDomains: Domain[]; filteredUserFavoriteDomains: Domain[] } {
  const trimmed = query.trim()
  if (!trimmed) {
    return { filteredCategories: categories, filteredFavoriteDomains: favoriteDomains, filteredUserFavoriteDomains: userFavoriteDomains }
  }

  const allDomains = [
    ...userFavoriteDomains,
    ...favoriteDomains,
    ...categories.flatMap((c) => c.domains),
  ]

  const fuse = new Fuse(allDomains, {
    keys: ['title', 'description', 'name'],
    threshold: 0.4,
    ignoreLocation: true,
  })

  const matchedIds = new Set(fuse.search(trimmed).map((r) => r.item.id))

  const filteredFavoriteDomains = favoriteDomains.filter((d) => matchedIds.has(d.id))
  const filteredUserFavoriteDomains = userFavoriteDomains.filter((d) => matchedIds.has(d.id))

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      domains: category.domains.filter((d) => matchedIds.has(d.id)),
    }))
    .filter((category) => category.domains.length > 0)

  return { filteredCategories, filteredFavoriteDomains, filteredUserFavoriteDomains }
}

export function useDomainSearch(
  categories: Category[],
  favoriteDomains: Domain[],
  userFavoriteDomains: Domain[]
): UseDomainSearchResult {
  const [searchQuery, setSearchQuery] = useState('')

  const { filteredCategories, filteredFavoriteDomains, filteredUserFavoriteDomains } = useMemo(
    () => filterBySearch(categories, favoriteDomains, userFavoriteDomains, searchQuery),
    [categories, favoriteDomains, userFavoriteDomains, searchQuery]
  )

  return { searchQuery, setSearchQuery, filteredCategories, filteredFavoriteDomains, filteredUserFavoriteDomains }
}

import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/store'
import { addFavoriteDomain, fetchUserFavorites, removeFavoriteDomain } from '../store/categoriesSlice'

let hasRequestedFavoritesInSession = false

export function useFavoriteDomains() {
  const dispatch = useAppDispatch()
  const { categories, userFavoriteDomainIds, hasLoadedUserFavorites, isLoading } = useAppSelector((state) => state.categories)

  useEffect(() => {
    if (!hasRequestedFavoritesInSession && !hasLoadedUserFavorites && userFavoriteDomainIds.length === 0 && !isLoading) {
      hasRequestedFavoritesInSession = true
      dispatch(fetchUserFavorites())
    }
  }, [dispatch, hasLoadedUserFavorites, isLoading, userFavoriteDomainIds.length])

  const userFavoriteDomains = useMemo(() => {
    const favoriteIds = new Set(userFavoriteDomainIds)
    return categories
      .flatMap((category) => category.domains)
      .filter((domain) => favoriteIds.has(domain.id))
  }, [categories, userFavoriteDomainIds])

  const toggleFavoriteDomain = (domainId: string) => {
    if (userFavoriteDomainIds.includes(domainId)) {
      dispatch(removeFavoriteDomain(domainId))
      return
    }

    dispatch(addFavoriteDomain(domainId))
  }

  const isFavorite = (domainId: string): boolean => userFavoriteDomainIds.includes(domainId)

  return {
    userFavoriteDomainIds,
    userFavoriteDomains,
    toggleFavoriteDomain,
    isFavorite,
  }
}

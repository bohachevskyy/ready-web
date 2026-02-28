import { filterBySearch } from './useDomainSearch'
import { Category, Domain } from '../store/categoriesSlice'

const makeDomain = (id: string, title: string, description = ''): Domain => ({
  id,
  name: id,
  title,
  description,
  icon: '',
  order: 0,
})

const makeCategory = (id: string, title: string, domains: Domain[]): Category => ({
  id,
  name: id,
  title,
  description: '',
  icon: '',
  order: 0,
  domains,
})

describe('filterBySearch', () => {
  const biology = makeDomain('bio', 'Biology & Medicine', 'Animals, ecosystems')
  const history = makeDomain('hist', 'History & Archaeology', 'Ancient civilizations')
  const adventure = makeDomain('adv', 'Adventure & Quest', 'Journeys, treasure hunts')

  const categories: Category[] = [
    makeCategory('nonfiction', 'Nonfiction', [biology, history]),
    makeCategory('fiction', 'Fiction', [adventure]),
  ]
  const favorites: Domain[] = [biology]

  it('returns all when query is empty', () => {
    const result = filterBySearch(categories, favorites, [], '')
    expect(result.filteredCategories).toEqual(categories)
    expect(result.filteredFavoriteDomains).toEqual(favorites)
  })

  it('returns all when query is whitespace', () => {
    const result = filterBySearch(categories, favorites, [], '   ')
    expect(result.filteredCategories).toEqual(categories)
  })

  it('filters domains by title match', () => {
    const result = filterBySearch(categories, favorites, [], 'biology')
    const allDomains = result.filteredCategories.flatMap((c) => c.domains)
    expect(allDomains.some((d) => d.id === 'bio')).toBe(true)
    // adventure should not match
    expect(allDomains.some((d) => d.id === 'adv')).toBe(false)
  })

  it('filters favorite domains too', () => {
    const result = filterBySearch(categories, favorites, [], 'adventure')
    expect(result.filteredFavoriteDomains).toHaveLength(0)
  })

  it('matches on description', () => {
    const result = filterBySearch(categories, favorites, [], 'ancient')
    expect(result.filteredCategories).toHaveLength(1)
    expect(result.filteredCategories[0].domains[0].id).toBe('hist')
  })

  it('performs fuzzy matching', () => {
    const result = filterBySearch(categories, favorites, [], 'biolgy')
    expect(result.filteredCategories.flatMap((c) => c.domains).some((d) => d.id === 'bio')).toBe(true)
  })

  it('removes categories with no matching domains', () => {
    const result = filterBySearch(categories, favorites, [], 'adventure')
    expect(result.filteredCategories.every((c) => c.id !== 'nonfiction')).toBe(true)
  })
})

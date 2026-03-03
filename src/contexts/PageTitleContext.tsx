import { createContext, useContext, useState, useCallback } from 'react'

interface PageTitleContextType {
  pageTitle: string
  setPageTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextType>({
  pageTitle: '',
  setPageTitle: () => {},
})

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [pageTitle, setPageTitleState] = useState('')

  const setPageTitle = useCallback((title: string) => {
    setPageTitleState(title)
    document.title = title ? `${title} — Readerly` : 'Readerly'
  }, [])

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle() {
  return useContext(PageTitleContext)
}

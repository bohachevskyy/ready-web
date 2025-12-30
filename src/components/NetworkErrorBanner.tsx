import { useAppSelector, useAppDispatch } from '../store/store'
import { refreshAccessToken } from '../store/authSlice'
import { useTranslation } from '../i18n/useTranslation'
import { Button } from './ui/button'

export function NetworkErrorBanner() {
  const { networkError, refreshToken } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  if (!networkError || !refreshToken) {
    return null
  }

  const handleRetry = async () => {
    try {
      await dispatch(refreshAccessToken(refreshToken)).unwrap()
    } catch (error) {
      // Error will be handled by the reducer
      console.error('Retry failed:', error)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium">{t('auth.errors.networkError')}</p>
          <p className="text-sm opacity-90">{t('auth.errors.networkErrorDescription')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="bg-white text-yellow-600 hover:bg-yellow-50 border-white"
        >
          {t('auth.retry')}
        </Button>
      </div>
    </div>
  )
}


import { Navigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../store/store'
import { Layout } from './Layout'
import { StoryReader } from './StoryReader'
import { PublicStoryReader } from './PublicStoryReader'
import { OnboardingCheck } from './OnboardingCheck'

const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export function StoryRoute() {
  const { param } = useParams<{ param: string }>()
  const token = useAppSelector((state) => state.auth.token)

  // Authenticated user: render normal StoryReader with layout and onboarding check
  if (token) {
    return (
      <OnboardingCheck>
        <Layout>
          <StoryReader />
        </Layout>
      </OnboardingCheck>
    )
  }

  // Unauthenticated with UUID: try to load as public story (backend enforces whitelist)
  if (param && isUUID(param)) {
    return <PublicStoryReader />
  }

  // Not authenticated and not a UUID (domain name): redirect to login
  return <Navigate to="/login" replace />
}

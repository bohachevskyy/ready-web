import { useEmailRedirect } from '../hooks/useEmailRedirect';

export function EmailRedirect() {
  const { state } = useEmailRedirect();

  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Redirecting to your story...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <p>Sorry, we couldn't find that story.</p>
      <a href="/">Go to home</a>
    </div>
  );
}

interface UpdateLanguageLevelOptions {
  token: string;
  languageLevel: number;
}

const BASE_URL = 'http://localhost:8080';

export async function updateLanguageLevel({ token, languageLevel }: UpdateLanguageLevelOptions) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ language_level: languageLevel }),
  });

  if (!response.ok) {
    let message = 'Unable to update language level.';

    try {
      const errorPayload = await response.json();
      if (errorPayload?.message && typeof errorPayload.message === 'string') {
        message = errorPayload.message;
      }
    } catch (err) {
      // Ignore JSON parsing errors and use default message
      console.error('Failed to parse error response', err);
    }

    throw new Error(message);
  }

  const contentType = response.headers.get('Content-Type');

  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (err) {
      console.error('Failed to parse update response', err);
    }
  }

  return null;
}

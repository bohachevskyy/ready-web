import { useCallback, useEffect, useMemo, useState } from 'react';
import { type RootState, useAppDispatch, useAppSelector } from '../store/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { setUser, updateUserLanguageLevel } from '../store/authSlice';
import { updateLanguageLevel } from '../services/userApi';

type MaybeUser = RootState['auth']['user'];
type User = Exclude<MaybeUser, null>;

const COMPLEXITY_LEVELS = [1, 2, 3, 4, 5];

export function useAccountSettings(resetKey?: unknown) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const [languageLevel, setLanguageLevel] = useState<number>(user?.language_level ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fullName = useMemo(() => {
    if (!user) return 'Unknown';
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    }
    return user?.name ?? user?.email ?? 'Unknown';
  }, [user]);

  useEffect(() => {
    setLanguageLevel(user?.language_level ?? 1);
  }, [user?.language_level]);

  useEffect(() => {
    setError(null);
    setIsSuccess(false);
  }, [resetKey]);

  useEffect(() => {
    setError(null);
    setIsSuccess(false);
  }, [languageLevel]);

  const handleSave = useCallback(async () => {
    if (!token) {
      setError('You must be signed in to update your account.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await updateLanguageLevel({
        token,
        languageLevel,
      });

      const updatedLevel =
        response && typeof response === 'object' && 'language_level' in response &&
        typeof (response as { language_level?: number }).language_level === 'number'
          ? (response as { language_level: number }).language_level
          : languageLevel;

      dispatch(updateUserLanguageLevel(updatedLevel));

      if (response && typeof response === 'object') {
        const nextUser = user
          ? ({ ...user, ...(response as Partial<User>) } as MaybeUser)
          : (response as MaybeUser);

        if (nextUser && typeof nextUser === 'object' && 'id' in nextUser) {
          dispatch(setUser(nextUser));
        }
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to update language level', err);
      setError(err instanceof Error ? err.message : 'Failed to update language level');
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, languageLevel, token, user]);

  return {
    user,
    fullName,
    languageLevel,
    setLanguageLevel,
    isSaving,
    error,
    isSuccess,
    handleSave,
  };
}

interface AccountSettingsFormProps {
  onClose?: () => void;
  resetKey?: unknown;
  className?: string;
  closeLabel?: string;
  showCloseButton?: boolean;
}

export function AccountSettingsForm({
  onClose,
  resetKey,
  className,
  closeLabel = 'Close',
  showCloseButton = true,
}: AccountSettingsFormProps) {
  const { user, fullName, languageLevel, setLanguageLevel, isSaving, error, isSuccess, handleSave } =
    useAccountSettings(resetKey);

  const containerClasses = `w-full max-w-md rounded-lg bg-card p-6 shadow-lg ${className ?? ''}`.trim();

  return (
    <div className={containerClasses}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Account Settings</h2>
        <p className="text-sm text-muted-foreground">
          Review your profile details and adjust your reading complexity level.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="account-name">Name</Label>
          <Input id="account-name" value={fullName} disabled readOnly />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account-age">Age</Label>
          <Input
            id="account-age"
            value={user?.age ? String(user.age) : 'Not provided'}
            disabled
            readOnly
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account-language-level">Reading complexity level</Label>
          <select
            id="account-language-level"
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={languageLevel}
            onChange={(event) => setLanguageLevel(Number(event.target.value))}
            disabled={isSaving}
          >
            {COMPLEXITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Higher levels increase story complexity and introduce richer vocabulary.
          </p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {isSuccess && !error && (
        <p className="mt-4 text-sm text-emerald-500">Language level updated successfully.</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {showCloseButton && onClose && (
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {closeLabel}
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

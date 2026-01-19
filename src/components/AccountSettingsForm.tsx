import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Toast } from './ui/toast';
import { updateUserLanguageLevel } from '../store/authSlice';
import { updateLanguageLevel } from '../store/userSlice';
import { useUserAge } from '../hooks/useUserAge';

type LanguageLevel = 1 | 2 | 3 | 4 | 5;

const languageLevels = [
  { level: 1, label: "A1", color: "bg-emerald-400", description: "Beginner" },
  { level: 2, label: "A2", color: "bg-green-400", description: "Elementary" },
  { level: 3, label: "B1", color: "bg-yellow-400", description: "Intermediate" },
  { level: 4, label: "B2", color: "bg-orange-400", description: "Upper Intermediate" },
  { level: 5, label: "C1", color: "bg-red-400", description: "Advanced" },
];

export function useAccountSettings(resetKey?: unknown) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isSaving = useAppSelector((state) => state.user.isUpdating);
  const { ageGroup } = useUserAge();

  const [languageLevel, setLanguageLevel] = useState<number>(user?.language_level ?? 1);
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
    setError(null);
    setIsSuccess(false);

    try {
      await dispatch(updateLanguageLevel({
        language_level: languageLevel,
      })).unwrap();

      dispatch(updateUserLanguageLevel(languageLevel));
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to update language level', err);
      setError(err instanceof Error ? err.message : 'Failed to update language level');
    }
  }, [dispatch, languageLevel]);

  return {
    user,
    fullName,
    ageGroup,
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
  closeLabel = 'Cancel',
  showCloseButton = true,
}: AccountSettingsFormProps) {
  const { fullName, ageGroup, languageLevel, setLanguageLevel, isSaving, error, isSuccess, handleSave } =
    useAccountSettings(resetKey);

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowToast(true);
    }
  }, [isSuccess]);

  return (
    <div className={`mx-auto max-w-2xl ${className ?? ''}`.trim()}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Account Settings</CardTitle>
              <CardDescription>Manage your profile and learning preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Name</Label>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-base text-foreground">
              {fullName}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Age Group</Label>
            <div className="rounded-lg border-2 border-primary bg-primary/10 px-6 py-4 text-center text-lg font-medium text-foreground">
              {ageGroup}
            </div>
          </div>

          {/* Language Complexity Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Language Complexity</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred difficulty level for reading materials
              </p>
            </div>

            {/* Current Level Display */}
            <div className="flex items-center justify-center gap-4 rounded-lg bg-muted/50 p-6">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  languageLevels[languageLevel - 1].color
                } text-2xl font-bold text-white shadow-lg`}
              >
                {languageLevels[languageLevel - 1].label}
              </div>
              <div>
                <p className="text-xl font-semibold">{languageLevels[languageLevel - 1].description}</p>
                <p className="text-sm text-muted-foreground">Level {languageLevel} of 5</p>
              </div>
            </div>

            {/* Custom Slider */}
            <div className="space-y-4">
              <div className="relative px-2">
                {/* Level markers */}
                <div className="mb-3 flex justify-between">
                  {languageLevels.map((level) => (
                    <div key={level.level} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-3 w-3 rounded-full transition-all ${
                          languageLevel >= level.level ? level.color : "bg-muted"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium transition-colors ${
                          languageLevel === level.level ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {level.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Slider track */}
                <div className="relative h-2 rounded-full bg-muted">
                  {/* Progress bar */}
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                      languageLevels[languageLevel - 1].color
                    }`}
                    style={{ width: `${((languageLevel - 1) / 4) * 100}%` }}
                  />
                </div>

                {/* Actual slider input */}
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={languageLevel}
                  onChange={(e) => setLanguageLevel(Number(e.target.value) as LanguageLevel)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  disabled={isSaving}
                />
              </div>

              {/* Level descriptions */}
              <div className="grid grid-cols-5 gap-2 text-center">
                {languageLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setLanguageLevel(level.level as LanguageLevel)}
                    className={`rounded-md p-2 text-xs transition-colors ${
                      languageLevel === level.level
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    disabled={isSaving}
                    type="button"
                  >
                    {level.description}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" size="lg" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showToast && <Toast message="Saved" onClose={() => setShowToast(false)} />}
    </div>
  );
}

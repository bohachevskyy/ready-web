import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Toast } from './ui/toast';
import { updateUserLanguageLevel } from '../store/authSlice';
import { updateLanguageLevel } from '../store/userSlice';
import { useUserAge } from '../hooks/useUserAge';
import { useTranslation } from '../i18n/useTranslation';
import { DuoCard } from './ui/duo-card';
import { DuoButton } from './ui/duo-button';
import { LevelSlider, type LevelOption } from './onboarding/LevelSlider';
import { LevelBadge } from './brand/icons';

type LanguageLevel = 1 | 2 | 3 | 4 | 5;

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
      await dispatch(
        updateLanguageLevel({ language_level: languageLevel }),
      ).unwrap();

      dispatch(updateUserLanguageLevel(languageLevel as LanguageLevel));
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
  resetKey?: unknown;
  className?: string;
}

export function AccountSettingsForm({ resetKey, className }: AccountSettingsFormProps) {
  const { t, tObject } = useTranslation();
  const {
    fullName,
    ageGroup,
    languageLevel,
    setLanguageLevel,
    isSaving,
    error,
    isSuccess,
    handleSave,
  } = useAccountSettings(resetKey);

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isSuccess) setShowToast(true);
  }, [isSuccess]);

  const levelsObj = tObject('data.levels');
  const levels: LevelOption[] = Object.entries(levelsObj).map(([, value]) => ({
    id: value.label,
    name: value.description,
  }));
  const idx = Math.max(0, Math.min(levels.length - 1, languageLevel - 1));
  const lvl = levels[idx];

  return (
    <DuoCard className={`anim-slide p-7 ${className ?? ''}`.trim()}>
      <SectionHeader
        title={t('account.settings')}
        subtitle={t('account.settingsSubtitle') || 'Manage your profile and learning preferences'}
        icon={<User className="h-6 w-6" strokeWidth={2.2} />}
      />

      {/* Name */}
      <div className="mt-5">
        <FieldLabel>{t('account.name')}</FieldLabel>
        <div
          className="rounded-[12px] border-2 border-line bg-[#FAF6E8] px-4 py-3.5 text-base font-semibold text-ink"
        >
          {fullName}
        </div>
      </div>

      {/* Age group */}
      <div className="mt-5">
        <FieldLabel>{t('account.ageGroup')}</FieldLabel>
        <div className="px-5 py-4 border-2 border-green rounded-[12px] bg-green-soft text-green-ink font-black text-lg text-center">
          {ageGroup}
        </div>
      </div>

      {/* Language complexity */}
      <div className="mt-5">
        <FieldLabel sub={t('account.languageComplexitySub') || 'Choose your preferred difficulty level for reading materials'}>
          {t('account.languageComplexity')}
        </FieldLabel>
        <div className="bg-[#FAF6E8] border-2 border-line rounded-[14px] px-5 py-5 flex items-center gap-4">
          <LevelBadge level={lvl.id} />
          <div className="flex-1">
            <div className="text-[20px] font-black">{lvl.name}</div>
            <div className="text-ink-soft text-[13px] mt-0.5">
              {t('account.levelOf', { current: idx + 1, total: levels.length }) ||
                `Level ${idx + 1} of ${levels.length}`}
            </div>
          </div>
        </div>
        <LevelSlider
          levels={levels}
          value={idx}
          onChange={(i) => setLanguageLevel(i + 1)}
        />
      </div>

      {error && <p className="text-sm font-bold text-heart-deep mt-3">{error}</p>}

      <DuoButton
        size="lg"
        block
        className="mt-6"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          t('common.saving')
        ) : isSuccess ? (
          <>
            <Check className="h-[18px] w-[18px]" /> {t('account.saved') || 'Saved'}
          </>
        ) : (
          t('account.saveChanges') || 'Save Changes'
        )}
      </DuoButton>

      {showToast && <Toast message={t('account.saved') || 'Saved'} onClose={() => setShowToast(false)} />}
    </DuoCard>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-[52px] h-[52px] rounded-full bg-green-soft text-green grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-black text-[26px] m-0 leading-tight">{title}</h2>
        <div className="text-ink-mute text-sm font-semibold mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

function FieldLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-2">
      <div className="text-[15px] font-black">{children}</div>
      {sub && <div className="text-ink-mute text-[13px] font-semibold mt-0.5">{sub}</div>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { Toast } from './ui/toast';
import { useFeedback } from '../hooks/useFeedback';
import { DuoCard } from './ui/duo-card';
import { DuoButton } from './ui/duo-button';

const RATING_CHIPS = ['❤️ Love it', "🙂 It's good", '🤔 Hmm', '😬 Frustrating'];

export function FeedbackSection() {
  const { t } = useTranslation();
  const { message, setMessage, isSubmitting, isSuccess, error, submitFeedback } = useFeedback();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isSuccess) setShowToast(true);
  }, [isSuccess]);

  const handleChip = (chip: string) => {
    setMessage(message ? `${message}\n${chip}` : chip);
  };

  return (
    <DuoCard className="anim-slide p-7">
      <div className="flex items-center gap-3.5">
        <div className="w-[52px] h-[52px] rounded-full bg-green-soft text-green grid place-items-center shrink-0">
          <MessageSquare className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="font-black text-[26px] m-0 leading-tight">{t('feedback.title')}</h2>
          <div className="text-ink-mute text-sm font-semibold mt-0.5">
            {t('feedback.description')}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[15px] font-black mb-2">{t('feedback.messageLabel')}</div>
        <textarea
          id="feedback-message"
          rows={5}
          className="w-full min-h-[120px] px-4 py-3.5 bg-[#FAF6E8] border-2 border-line rounded-[12px] text-base font-semibold outline-none resize-y leading-[1.5] text-ink placeholder:text-ink-mute focus:border-green focus:shadow-[0_0_0_4px_hsl(var(--green-soft))] transition-[border-color,box-shadow] font-sans"
          placeholder={t('feedback.placeholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="mt-3.5 flex items-center gap-2.5 flex-wrap">
        <span className="text-ink-mute text-[13px] font-extrabold">
          {t('feedback.quickRating') || 'Quick rating:'}
        </span>
        {RATING_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChip(chip)}
            disabled={isSubmitting}
            className="bg-paper border-2 border-line rounded-[12px] px-3 py-2 text-[12px] font-bold text-ink cursor-pointer hover:brightness-105 shadow-[0_4px_0_hsl(var(--line-2))] active:translate-y-[3px] active:shadow-[0_1px_0_hsl(var(--line-2))] font-sans"
          >
            {chip}
          </button>
        ))}
      </div>

      {error && <p className="text-sm font-bold text-heart-deep mt-3">{error}</p>}

      <DuoButton
        size="lg"
        block
        className="mt-5"
        onClick={submitFeedback}
        disabled={isSubmitting || !message.trim()}
      >
        {isSubmitting ? (
          t('feedback.submitting')
        ) : isSuccess ? (
          <>
            <Check className="h-[18px] w-[18px]" /> {t('feedback.thanks') || 'Thanks!'}
          </>
        ) : (
          t('feedback.submit')
        )}
      </DuoButton>

      {showToast && (
        <Toast message={t('feedback.success')} onClose={() => setShowToast(false)} />
      )}
    </DuoCard>
  );
}

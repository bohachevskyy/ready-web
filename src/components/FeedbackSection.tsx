import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Toast } from './ui/toast';
import { useFeedback } from '../hooks/useFeedback';

export function FeedbackSection() {
  const { t } = useTranslation();
  const { message, setMessage, isSubmitting, isSuccess, error, submitFeedback } = useFeedback();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowToast(true);
    }
  }, [isSuccess]);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('feedback.title')}</CardTitle>
              <CardDescription>{t('feedback.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message" className="text-base font-semibold">
              {t('feedback.messageLabel')}
            </Label>
            <textarea
              id="feedback-message"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('feedback.placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex pt-2">
            <Button
              onClick={submitFeedback}
              disabled={isSubmitting || !message.trim()}
              size="lg"
              className="flex-1"
            >
              {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showToast && <Toast message={t('feedback.success')} onClose={() => setShowToast(false)} />}
    </div>
  );
}

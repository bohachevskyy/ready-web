import { useNavigate } from 'react-router-dom';
import { AuthForm } from './AuthForm';
import { Wordmark } from './brand/Wordmark';
import { useTranslation } from '../i18n/useTranslation';

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="h-screen w-screen flex bg-cream overflow-hidden">
      {/* Left — pitch */}
      <div
        className="relative overflow-hidden flex flex-col px-14 py-14 hidden lg:flex"
        style={{
          flexBasis: '54%',
          background: 'linear-gradient(165deg, #FFF6D6 0%, #FFE7B0 55%, #FFD27A 100%)',
        }}
      >
        <Wordmark size={36} />

        <div className="flex-1 flex flex-col justify-center max-w-[560px] relative z-10">
          <span
            className="inline-flex self-start items-center gap-2 bg-paper border-2 border-[#E8C45D] rounded-full px-3.5 py-1.5 mb-4 font-black text-[12px] tracking-widest text-[#7A5A0E] uppercase"
            style={{ boxShadow: '0 3px 0 #C99E2C' }}
          >
            <span className="w-2 h-2 rounded-full bg-green" />
            {t('auth.freeForeverPill') || 'Free forever · No card needed'}
          </span>

          <h1
            className="font-black text-[#3D2A00] m-0 leading-[.98] tracking-tight"
            style={{ fontSize: 64, textWrap: 'balance' as any }}
          >
            {t('auth.headline') || 'Curiosity is the best teacher.'}
          </h1>

          <p className="text-[22px] font-bold text-green-ink m-0 mt-[18px] mb-2">
            {t('auth.subhead') || 'Find your perfect story in seconds.'}
          </p>

          <p
            className="text-base font-semibold text-[#5B3D00] leading-[1.55] m-0 max-w-[480px]"
            style={{ textWrap: 'pretty' as any }}
          >
            <strong>{t('auth.pitchLead') || '200 categories. Thousands of stories. 20+ languages.'}</strong>{' '}
            {t('auth.pitchBody') ||
              "Readerly is a library built for language learners — pick something you'd Google at 2 AM, tap any word for an instant translation, and keep your streak going."}
          </p>

          <div className="mt-7 grid gap-3.5 max-w-[520px]">
            <Feat
              icon="hand"
              title={t('auth.feature1Title') || 'Instant translation'}
              desc={t('auth.feature1Desc') || 'Tap any word for the meaning in your language — without leaving the story.'}
            />
            <Feat
              icon="book"
              title={t('auth.feature2Title') || 'Real stories, not textbook drills'}
              desc={t('auth.feature2Desc') || 'Astronomy, biographies, mythology, business — read what you actually care about.'}
            />
            <Feat
              icon="layers"
              title={t('auth.feature3Title') || 'Every level, A1 to C1'}
              desc={t('auth.feature3Desc') || 'Stories adapt to you. From everyday English to professional vocabulary.'}
            />
          </div>
        </div>

        {/* Floating word chips */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <FloatChip word="petrichor" lang="EN" top="18%" right="6%" delay={0.2} rot={3} />
          <FloatChip word="saudade" lang="PT" top="58%" right="14%" delay={0.8} rot={3} />
          <FloatChip word="ikigai" lang="JP" top="82%" right="8%" delay={1.4} rot={3} />
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col scroll-cream">
        <div className="flex-1 grid place-items-center p-10">
          <AuthForm onSuccess={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
}

function Feat({
  icon,
  title,
  desc,
}: {
  icon: 'hand' | 'book' | 'layers';
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3.5 items-start">
      <div
        className="w-10 h-10 rounded-[10px] bg-paper border-2 border-[#E8C45D] grid place-items-center shrink-0 text-[#7A5A0E]"
        style={{ boxShadow: '0 3px 0 #C99E2C' }}
      >
        <FeatIcon name={icon} />
      </div>
      <div>
        <div className="text-base font-black text-[#3D2A00]">{title}</div>
        <div
          className="text-sm font-semibold text-[#5B3D00] leading-[1.45] mt-0.5"
          style={{ textWrap: 'pretty' as any }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function FeatIcon({ name }: { name: 'hand' | 'book' | 'layers' }) {
  const p = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (name === 'hand') {
    return (
      <svg {...p}>
        <path d="M9 11V5a2 2 0 0 1 4 0v6" />
        <path d="M13 9V4a2 2 0 0 1 4 0v9" />
        <path d="M17 9V6a2 2 0 0 1 4 0v9a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6V9a2 2 0 0 1 4 0v4" />
      </svg>
    );
  }
  if (name === 'book') {
    return (
      <svg {...p}>
        <path d="M4 4h7v16H6a2 2 0 0 0-2 2V4Z" />
        <path d="M20 4h-7v16h5a2 2 0 0 1 2 2V4Z" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 18 9 5 9-5" />
    </svg>
  );
}

function FloatChip({
  word,
  lang,
  top,
  left,
  right,
  delay = 0,
  rot = 3,
}: {
  word: string;
  lang: string;
  top: string;
  left?: string;
  right?: string;
  delay?: number;
  rot?: number;
}) {
  return (
    <div
      className="absolute bg-paper border-2 border-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5"
      style={{
        top,
        left,
        right,
        animation: `float 4s ease-in-out ${delay}s infinite`,
        boxShadow: '0 4px 0 hsl(var(--line-2))',
        transform: `rotate(${left ? -rot : rot}deg)`,
      }}
    >
      <span className="text-[11px] font-black text-green-ink bg-green-soft px-1.5 py-0.5 rounded-md tracking-wider">
        {lang}
      </span>
      <span className="font-serif text-lg font-semibold text-ink">{word}</span>
    </div>
  );
}

import { Home, LogOut, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Wordmark } from './brand/Wordmark';
import { useAppSelector } from '../store/store';
import { cn } from '../lib/utils';

interface NavigationBarProps {
  onHomeClick: () => void;
  onLogout: () => void;
  onAccountClick: () => void;
}

type NavKey = 'learn' | 'practice';

interface NavItem {
  key: NavKey;
  label: string;
  icon: typeof Home;
  onClick: () => void;
  matches: (pathname: string) => boolean;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = (name && name.trim()) || (email && email.split('@')[0]) || '';
  if (!source) return 'R';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function NavigationBar({ onHomeClick, onLogout, onAccountClick }: NavigationBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const initials = getInitials(
    user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' '),
    user?.email,
  );

  const items: NavItem[] = [
    {
      key: 'learn',
      label: t('navigation.learn') || 'Learn',
      icon: Home,
      onClick: onHomeClick,
      matches: (p) => p === '/' || p.startsWith('/story'),
    },
    {
      key: 'practice',
      label: t('navigation.practice') || 'Practice',
      icon: Sparkles,
      onClick: () => navigate('/practice'),
      matches: (p) => p.startsWith('/practice'),
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper border-b-2 border-line">
      <div className="flex h-16 items-center gap-4 px-7">
        <button
          type="button"
          onClick={onHomeClick}
          className="bg-transparent border-0 cursor-pointer p-0 mr-2"
          aria-label="Readerly home"
        >
          <Wordmark size={26} />
        </button>

        <div className="hidden md:flex items-center gap-1 ml-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.matches(location.pathname);
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px]',
                  'border-0 font-extrabold text-[14px] tracking-wide uppercase cursor-pointer',
                  'transition-colors',
                  active
                    ? 'bg-green-soft text-green-ink'
                    : 'bg-transparent text-ink-soft hover:bg-cream-2/40',
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={onAccountClick}
            title={t('navigation.account') || 'Account'}
            className={cn(
              'w-10 h-10 rounded-full bg-gold-soft border-2 border-line',
              'grid place-items-center cursor-pointer font-black text-ink text-sm',
              'hover:brightness-105 transition-[filter]',
            )}
          >
            {initials}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className={cn(
              'inline-flex items-center justify-center w-10 h-10 rounded-full',
              'bg-transparent border-0 text-ink-soft cursor-pointer',
              'hover:bg-cream-2/40 hover:text-heart-deep transition-colors',
            )}
            title={t('navigation.logout') || 'Logout'}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

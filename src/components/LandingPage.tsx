import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const SCROLLING_TOPICS = [
  'Volcanoes', 'K-Pop', 'Renaissance Art', 'Coffee Culture', 'Formula 1',
  'Neural Networks', 'Greek Myths', 'Space Travel', 'Street Food', 'Jazz History',
  'Quantum Physics', 'Anime', 'Ocean Life', 'Photography', 'Chess Strategy',
  'Yoga', 'Cryptocurrency', 'Ancient Rome', 'Skateboarding', 'Climate Science',
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            <span>Readerly</span>
          </a>
          <div className="hidden items-center gap-6 sm:flex">
            <a href="#discover" className="text-sm text-gray-400 transition hover:text-white">Browse</a>
            <a href="#how-it-works" className="text-sm text-gray-400 transition hover:text-white">How It Works</a>
            <a href="https://readerly.ai/blog" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 transition hover:text-white">Blog</a>
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-emerald-500 text-white hover:bg-emerald-400 border-0 shadow-lg shadow-emerald-500/25"
            >
              Download
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/login')}
            className="bg-emerald-500 text-white hover:bg-emerald-400 border-0 sm:hidden"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
        {/* Gradient orb background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-20 right-0 h-[300px] w-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            The world's library for language learners
          </p>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Curiosity is the{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              best teacher.
            </span>
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-gray-300 sm:text-xl">
            Find your perfect story in seconds.
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base text-gray-500 sm:text-lg">
            200 categories. Thousands of stories. 20+ languages supported.
            Readerly is the world's largest library built for language learners — and it starts with what <em className="text-gray-300">you</em> want to read.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="h-12 px-8 text-base font-semibold bg-emerald-500 text-white hover:bg-emerald-400 border-0 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-105"
            >
              <Search className="mr-2 h-5 w-5" />
              Discover Stories
            </Button>
            <a
              href="https://readerly.ai/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
            >
              Visit the Blog <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Scrolling Topic Strip */}
      <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-5">
        {/* Gradient masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0a0a0f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0a0a0f] to-transparent" />

        <div className="animate-scroll flex gap-8 whitespace-nowrap">
          {[...SCROLLING_TOPICS, ...SCROLLING_TOPICS].map((topic, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500"
            >
              <span className="bg-gradient-to-r from-emerald-400/80 to-teal-400/80 bg-clip-text text-transparent">{topic}</span>
              <span className="text-emerald-600/40">→</span>
            </span>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-white/5 bg-white/[0.02] py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 px-4 sm:gap-12">
          {[
            { value: '200', label: 'Categories' },
            { value: '1000s', label: 'of Stories' },
            { value: '20+', label: 'Languages' },
            { value: '∞', label: 'Curiosity' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Every Interest Has a Story */}
      <section id="discover" className="relative px-4 py-20 sm:px-6 sm:py-32">
        <div className="pointer-events-none absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                Every Interest Has a{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Story</span>
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-400">
                Language learning shouldn't feel like homework. On Readerly, you choose what to read — from quantum physics to Korean street food — and the app handles the rest.
              </p>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  Tap any word for instant translation
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  Stories adapt to your level
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  You never run out of things to read
                </li>
              </ul>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-emerald-500/20 to-transparent blur-xl" />
                <div className="relative w-[280px] rounded-[2rem] border border-white/10 bg-[#141420] p-3 shadow-2xl">
                  <div className="rounded-[1.25rem] bg-[#1a1a2e] p-4">
                    {/* Mock story cards */}
                    <div className="mb-3 text-center text-xs font-medium text-gray-500">Popular Stories</div>
                    {[
                      { title: 'The Secret Life of Volcanoes', cat: 'Science', color: 'from-red-500/20 to-orange-500/20' },
                      { title: 'How K-Pop Conquered the World', cat: 'Culture', color: 'from-purple-500/20 to-pink-500/20' },
                      { title: 'Coffee: A Global Journey', cat: 'Food', color: 'from-amber-500/20 to-yellow-500/20' },
                    ].map((story) => (
                      <div key={story.title} className={`mb-2 rounded-lg bg-gradient-to-r ${story.color} p-3`}>
                        <div className="text-[11px] font-semibold text-white/90">{story.title}</div>
                        <div className="mt-1 text-[9px] text-gray-400">{story.cat} · 5 min read</div>
                      </div>
                    ))}
                    <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                      <span className="text-[10px] text-emerald-400">Tap any word to translate →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Taps to Learning */}
      <section id="how-it-works" className="relative border-t border-white/5 bg-white/[0.01] px-4 py-20 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            Three Taps to{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Learning</span>
          </h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Search or browse',
                desc: '200 categories, always growing',
                icon: <Search className="h-6 w-6" />,
              },
              {
                step: '2',
                title: 'Read what grabs you',
                desc: 'Stories matched to your level',
                icon: <BookOpen className="h-6 w-6" />,
              },
              {
                step: '3',
                title: 'Learn without trying',
                desc: 'Words stick when they come from stories you care about',
                icon: <Sparkles className="h-6 w-6" />,
              },
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-emerald-500/20 hover:bg-white/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                  {item.icon}
                </div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400/60">Step {item.step}</div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="border-t border-white/5 px-4 py-20 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
            Learn More on Our{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Blog</span>
          </h2>
          <p className="mb-8 text-lg text-gray-400">
            Our blog is packed with free guides, reading strategies, and hand-picked story collections for every level.
          </p>

          <a
            href="https://readerly.ai/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 inline-flex"
          >
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all hover:border-white/20"
            >
              Explore the Blog <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span>New posts weekly</span>
            <span className="text-emerald-600/40">·</span>
            <span>Reading tips</span>
            <span className="text-emerald-600/40">·</span>
            <span>Category deep-dives</span>
            <span className="text-emerald-600/40">·</span>
            <span>Learner interviews</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-white/5 px-4 py-20 sm:px-6 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            The best way to learn a language?{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Read what you love.
            </span>
          </h2>
          <p className="mb-10 text-lg text-gray-500">
            Thousands of stories. Hundreds of topics. Your level.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="h-14 px-10 text-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-400 border-0 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-105"
          >
            Start Exploring — Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>© {new Date().getFullYear()} Readerly. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="https://readerly.ai/blog" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Blog</a>
            <a href="mailto:support@readerly.ai" className="transition hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

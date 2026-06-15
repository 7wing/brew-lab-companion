import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useOnboarding, useUpdateOnboarding } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// ─── Seed brewers for Step 4 ───────────────────────────────────────────────
const SEED_BREWERS = [
  {
    id: 'seed-brewer-1',
    display_name: 'Hops Harmony',
    username: 'hops_harmony',
    avatar_url: null,
    specialty: 'IPA Specialist',
    tagline: 'Always chasing that hop punch.',
  },
  {
    id: 'seed-brewer-2',
    display_name: 'Mead Maven',
    username: 'mead_maven',
    avatar_url: null,
    specialty: 'Mead Expert',
    tagline: 'Honey, yeast, and patience.',
  },
  {
    id: 'seed-brewer-3',
    display_name: 'FermentationNerd',
    username: 'fermentation_nerd',
    avatar_url: null,
    specialty: 'Fermentation Nerd',
    tagline: 'Temp control is life.',
  },
]

// ─── Brew type options ──────────────────────────────────────────────────────
const BREW_TYPES = [
  { value: 'beer', label: 'Beer' },
  { value: 'cider', label: 'Cider' },
  { value: 'mead', label: 'Mead' },
  { value: 'kombucha', label: 'Kombucha' },
  { value: 'wine', label: 'Wine' },
  { value: 'sourdough', label: 'Sourdough' },
] as const

// ─── Experience level options ───────────────────────────────────────────────
const EXPERIENCE_LEVELS = [
  { value: 'just_starting', label: 'Just starting out' },
  { value: '1-2_years', label: '1–2 years' },
  { value: '3-5_years', label: '3–5 years' },
  { value: '5plus_years', label: '5+ years' },
] as const

const TOTAL_STEPS = 4

// ─── Avatar placeholder component ───────────────────────────────────────────
function AvatarPlaceholder({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className="rounded-full bg-gradient-to-br from-copper/40 to-teal/40 border-2 border-copper/30 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-bold text-copper">{initials}</span>
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: onboardingData } = useOnboarding()
  const updateOnboarding = useUpdateOnboarding()
  const [step, setStep] = useState(1)

  // Step 1: brew types
  const [selectedBrewTypes, setSelectedBrewTypes] = useState<string[]>([])
  // Step 2: experience level
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)
  // Step 3: log first batch
  const [logFirstBatch, setLogFirstBatch] = useState<boolean | null>(null)
  // Step 4: followed users
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [isFollowing, setIsFollowing] = useState(false)

  // ─── Persist step 1 ─────────────────────────────────────────────────────
  const handleStep1Continue = async () => {
    if (selectedBrewTypes.length > 0) {
      await updateOnboarding.mutateAsync({ brew_types: selectedBrewTypes as never[] })
    }
    setStep(2)
  }

  // ─── Persist step 2 ─────────────────────────────────────────────────────
  const handleStep2Continue = async () => {
    if (selectedExperience) {
      await updateOnboarding.mutateAsync({ experience_level: selectedExperience })
    }
    setStep(3)
  }

  // ─── Step 3 handlers ────────────────────────────────────────────────────
  const handleStep3Yes = () => {
    setLogFirstBatch(true)
  }

  // ─── Persist step 4 & complete onboarding ───────────────────────────────
  const handleFinish = async () => {
    // Follow seed brewers
    if (followedIds.size > 0 && user) {
      setIsFollowing(true)
      const followRows = Array.from(followedIds).map((followedId) => ({
        follower_id: user.id,
        followed_id: followedId,
      }))
      try {
        await supabase.from('follows').insert(followRows)
      } catch {
        // Non-critical — don't block completion
      }
      setIsFollowing(false)
    }

    await updateOnboarding.mutateAsync({ onboarding_completed: true })

    if (logFirstBatch === true) {
      navigate('/new-brew')
    } else {
      navigate('/')
    }
  }

  const handleSkip = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      // Final skip — just mark completed
      updateOnboarding.mutate({ onboarding_completed: true }, { onSuccess: () => navigate('/') })
    }
  }

  // ─── Chip toggle for brew types ─────────────────────────────────────────
  const toggleBrewType = (value: string) => {
    setSelectedBrewTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  // ─── Follow/unfollow brewer ─────────────────────────────────────────────
  const toggleFollow = (id: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const isUpdating = updateOnboarding.isPending || isFollowing

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Full-screen backdrop gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(176, 140, 100, 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(20, 100, 90, 0.10), transparent)',
        }}
      />

      {/* Progress bar */}
      <div className="w-full px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-xs text-muted-foreground">
            {step === 1 && 'What you brew'}
            {step === 2 && 'Experience level'}
            {step === 3 && 'First batch'}
            {step === 4 && 'Follow brewers'}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-copper to-teal rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        {/* ── Step 1: What you brew ── */}
        {step === 1 && (
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Homebrew Haven 🍺
            </h1>
            <p className="text-muted-foreground mb-8">
              What do you like to brew? (select all that apply)
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {BREW_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleBrewType(value)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    selectedBrewTypes.includes(value)
                      ? 'border-copper bg-copper/15 text-copper shadow-[0_0_12px_rgba(176,140,100,0.2)]'
                      : 'border-border bg-card text-foreground hover:border-copper/50 hover:bg-copper/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-copper to-copper/80 hover:from-copper/90 hover:to-copper/70 text-white font-semibold shadow-md"
                onClick={handleStep1Continue}
              >
                Continue
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Experience level ── */}
        {step === 2 && (
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              How long have you been brewing?
            </h1>
            <p className="text-muted-foreground mb-8">
              Let us tailor your Homebrew Haven experience.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {EXPERIENCE_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedExperience(value)}
                  className={`w-full px-5 py-4 rounded-xl border-2 text-left text-sm font-medium transition-all duration-200 ${
                    selectedExperience === value
                      ? 'border-copper bg-copper/15 text-copper shadow-[0_0_12px_rgba(176,140,100,0.2)]'
                      : 'border-border bg-card text-foreground hover:border-copper/50 hover:bg-copper/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-copper to-copper/80 hover:from-copper/90 hover:to-copper/70 text-white font-semibold shadow-md"
                onClick={handleStep2Continue}
              >
                Continue
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: First batch ── */}
        {step === 3 && (
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Do you have something brewing right now?
            </h1>
            <p className="text-muted-foreground mb-8">
              Log your first batch and start tracking your fermentation journey.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <button
                onClick={() => {
                  handleStep3Yes()
                  setStep(4)
                }}
                className="w-full px-6 py-5 rounded-xl border-2 border-teal/50 bg-teal/10 hover:bg-teal/20 hover:border-teal text-foreground text-sm font-semibold transition-all duration-200 text-left flex items-center justify-between group"
              >
                <span>Yes, let's log it →</span>
                <span className="text-teal group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
              <button
                onClick={() => {
                  setLogFirstBatch(false)
                  setStep(4)
                }}
                className="w-full px-6 py-5 rounded-xl border-2 border-border bg-card hover:bg-muted/30 hover:border-border/80 text-foreground text-sm font-medium transition-all duration-200 text-left"
              >
                Not yet, I'll look around first
              </button>
            </div>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </div>
        )}

        {/* ── Step 4: Follow brewers ── */}
        {step === 4 && (
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Here are some brewers you might like
            </h1>
            <p className="text-muted-foreground mb-6">
              Follow brewers to fill your Brew Bench with inspiration.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {SEED_BREWERS.map((brewer) => {
                const isFollowed = followedIds.has(brewer.id)
                return (
                  <div
                    key={brewer.id}
                    className="glass-panel rounded-xl p-4 flex items-center gap-4"
                  >
                    <AvatarPlaceholder name={brewer.display_name} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-foreground">
                        {brewer.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{brewer.username}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-copper/15 text-copper text-[10px] font-medium">
                        {brewer.specialty}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={isFollowed ? 'outline' : 'default'}
                      className={
                        isFollowed
                          ? 'border-copper/50 text-copper hover:bg-copper/10'
                          : 'bg-gradient-to-r from-copper to-copper/80 hover:from-copper/90 hover:to-copper/70 text-white'
                      }
                      onClick={() => toggleFollow(brewer.id)}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-teal to-teal/80 hover:from-teal/90 hover:to-teal/70 text-white font-semibold shadow-md"
                onClick={handleFinish}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving…' : 'Go to Brew Bench'}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleSkip}
                disabled={isUpdating}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
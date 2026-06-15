import { Link } from "react-router-dom";
import { FlaskConical, BookOpen, Users, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BubbleBackground from "@/components/BubbleBackground";
import { APP, AUTH } from "@/constants/copy";

const features = [
  {
    icon: FlaskConical,
    title: "Brew Bench",
    description: "Track your batches from grain to glass. Log gravity readings, temperatures, and fermentation progress in real-time.",
  },
  {
    icon: BookOpen,
    title: "Recipe Vault",
    description: "Discover hundreds of community recipes or share your own creations. Find the perfect brew for any occasion.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow homebrewers, share your brew days, and learn from experienced makers in the community.",
  },
];

const steps = [
  {
    number: 1,
    title: "Create your account",
    description: "Sign up free in seconds using Google, GitHub, or email. No credit card required.",
  },
  {
    number: 2,
    title: "Log your first batch",
    description: "Start tracking your brew day with our intuitive tools. Record gravity, temperature, and notes.",
  },
  {
    number: 3,
    title: "Join the community",
    description: "Share your creations, discover new recipes, and connect with brewers worldwide.",
  },
];

const testimonials = [
  {
    name: "Marcus Chen",
    role: "All-grain brewer, 5 years",
    quote: "Homebrew Haven transformed how I track my batches. The gravity logging alone has helped me dial in my IPA recipe perfectly.",
  },
  {
    name: "Sarah Lindström",
    role: "Competition winner, Nordic Brew Fest",
    quote: "The community features are incredible. I've learned so much from fellow brewers and even won my first competition using a recipe I found here.",
  },
  {
    name: "Jake Morrison",
    role: "Brew day streamer & content creator",
    quote: "Finally, a platform that understands brewers. The recipe sharing and community aspect make every brew day feel like a collaboration.",
  },
];

export default function Landing() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <BubbleBackground count={15} />

      {/* ─── Minimal Nav Bar ─── */}
      <header className="relative z-50 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-md">
                <FlaskConical size={20} className="text-copper-foreground" />
              </div>
              <span className="font-slab font-bold text-lg">{APP.appName}</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/auth?mode=login">{AUTH.login}</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">{AUTH.signup}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main>
        {/* ─── Hero Section ─── */}
        <section className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              <span className="text-sm text-muted-foreground">The brewing companion for serious homebrewers</span>
            </div>

            {/* Headline */}
            <h1 className="font-slab text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-foreground">The brewing companion for</span>
              <br />
              <span className="bg-gradient-to-r from-copper via-gold to-teal bg-clip-text text-transparent">
                serious homebrewers
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Track your batches, discover recipes, and connect with a community of homebrewers — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth?mode=signup">
                  Sign up free
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("how-it-works")}
                className="gap-2"
              >
                See how it works
              </Button>
            </div>

            {/* Social Proof */}
            <p className="mt-12 text-sm text-muted-foreground">
              Trusted by <span className="font-semibold text-foreground">2,400+</span> homebrewers worldwide
            </p>
          </div>
        </section>

        {/* ─── Feature Highlights ─── */}
        <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-slab text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to brew better
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful tools designed specifically for homebrewers, from beginners to competition winners.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-panel rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-copper/20 to-gold/20 flex items-center justify-center mb-6 group-hover:from-copper/30 group-hover:to-gold/30 transition-colors">
                    <feature.icon size={28} className="text-copper" />
                  </div>
                  <h3 className="font-slab text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-slab text-3xl sm:text-4xl font-bold mb-4">
                Start brewing in minutes
              </h2>
              <p className="text-muted-foreground text-lg">
                Three simple steps to your new brewing companion.
              </p>
            </div>

            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-copper/30 via-gold/30 to-teal/30" />

              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step) => (
                  <div key={step.number} className="text-center relative">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass-panel-strong shadow-lg mb-6">
                      <span className="font-slab text-4xl font-bold bg-gradient-to-br from-copper to-gold bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-slab text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-slab text-3xl sm:text-4xl font-bold mb-4">
                Loved by homebrewers everywhere
              </h2>
              <p className="text-muted-foreground text-lg">
                See what our community is saying.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className="glass-panel rounded-2xl p-8 flex flex-col"
                >
                  {/* Quote marks */}
                  <div className="text-5xl font-serif text-copper/20 mb-2 leading-none">
                    "
                  </div>
                  <blockquote className="text-foreground leading-relaxed mb-6 flex-1">
                    {testimonial.quote}
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-copper to-gold flex items-center justify-center">
                      <span className="text-copper-foreground font-semibold text-sm">
                        {testimonial.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-panel-strong rounded-3xl p-12 sm:p-16 border border-border/60 shadow-2xl">
              <FlaskConical size={48} className="text-copper mx-auto mb-6" />
              <h2 className="font-slab text-3xl sm:text-4xl font-bold mb-4">
                Ready to start brewing?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of homebrewers who've already made Homebrew Haven their go-to brewing companion.
              </p>
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth?mode=signup">
                  Sign up free
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-teal" />
                  Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-teal" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-teal" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="relative z-10 border-t border-border/30 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-copper to-gold flex items-center justify-center">
                  <FlaskConical size={16} className="text-copper-foreground" />
                </div>
                <span className="font-slab font-bold">{APP.appName}</span>
              </div>

              {/* Links */}
              <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">About</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              </nav>

              {/* Copyright */}
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {APP.appName}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
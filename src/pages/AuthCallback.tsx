import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, FlaskConical, AlertCircle } from "lucide-react";

type AuthState = "loading" | "success" | "error";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // PKCE code exchange (magic links, password reset, OAuth)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Check if session is already established
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          setState("success");
          const redirectTo = sessionStorage.getItem("redirectTo") || "/";
          sessionStorage.removeItem("redirectTo");
          navigate(redirectTo, { replace: true });
          return;
        }

        // Fallback: listen for SIGNED_IN event (legacy hash tokens, race conditions)
        const sessionFromEvent = await new Promise((resolve) => {
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN") {
              resolve(session);
            }
          });

          setTimeout(() => {
            subscription.unsubscribe();
            resolve(null);
          }, 3000);
        });

        if (sessionFromEvent) {
          setState("success");
          const redirectTo = sessionStorage.getItem("redirectTo") || "/";
          sessionStorage.removeItem("redirectTo");
          navigate(redirectTo, { replace: true });
          return;
        }

        throw new Error(
          "Unable to establish a session. The link may have expired or already been used."
        );
      } catch (err: any) {
        setState("error");
        setErrorMessage(err?.message || "Something went wrong during authentication.");
      } finally {
        // Strip tokens from URL so they are not left visible
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };

    completeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper/20 to-teal/20 flex items-center justify-center mx-auto mb-4">
          <FlaskConical size={24} className="text-copper" />
        </div>

        {state === "loading" && (
          <>
            <h1 className="font-slab text-xl font-bold mb-2">Completing sign in</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Just a moment while we verify your session…
            </p>
            <div className="flex justify-center">
              <Loader2 size={32} className="animate-spin text-copper" />
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="flex justify-center mb-3">
              <AlertCircle size={32} className="text-destructive" />
            </div>
            <h1 className="font-slab text-xl font-bold mb-2">Sign in failed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  );
}

import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sign In — Chronos",
  description: "Sign in to Chronos productivity operating system.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session) {
    redirect(callbackUrl || "/dashboard");
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-11 rounded-xl bg-violet-600/15 dark:bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400 shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Chronos
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Personal Productivity Operating System
          </p>
        </div>

        {/* Minimal card */}
        <div className="w-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 shadow-xl flex flex-col gap-4">
          <div className="text-center mb-1">
            <h2 className="text-sm font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in to access your projects and tasks
            </p>
          </div>

          {/* Google Sign In form */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl || "/dashboard" });
            }}
          >
            <Button
              id="google-signin-btn"
              type="submit"
              variant="outline"
              size="lg"
              className="w-full h-10 gap-2.5 font-medium border-border/80 hover:bg-accent/60"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </form>

          {/* Quick Development Account access */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("credentials", {
                email: "alex.rivera@example.com",
                redirectTo: callbackUrl || "/dashboard",
              });
            }}
          >
            <Button
              id="dev-signin-btn"
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full h-10 text-xs font-medium"
            >
              Continue as Alex Rivera (Demo)
            </Button>
          </form>

          <p className="text-[11px] text-center text-muted-foreground/80 mt-2">
            Protected by Chronos Security and Auth.js
          </p>
        </div>
      </div>
    </main>
  );
}

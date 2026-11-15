import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

const AdminLogin = () => {
  const { signIn, signOut, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedFrom = (location.state as { from?: string } | null)?.from;
  const from = typeof requestedFrom === "string" && requestedFrom.startsWith("/admin") ? requestedFrom : "/admin";

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && isAdmin && !loading) navigate(from, { replace: true });
  }, [user, isAdmin, loading, from, navigate]);

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signIn();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Cannot sign in</CardTitle>
            <CardDescription>
              Google administrator sign-in requires Firebase configuration. Add the <code className="text-xs">VITE_FIREBASE_*</code>{" "}
              values from the Shiva Firebase project, enable the Google provider, and return here.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild>
              <Link to="/">Back to website</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </div>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Sign in with the verified Shiva Google account. Administrator access also requires the Firebase admin claim.</CardDescription>
        </CardHeader>
        <CardContent>
          {user && !isAdmin && !loading && <div role="alert" className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">This Google account is not the authorized Shiva administrator or is missing the admin claim. <button type="button" className="underline" onClick={() => void signOut()}>Sign out</button></div>}
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="button" className="w-full" disabled={submitting || loading} onClick={() => void handleSignIn()}>
              {submitting ? "Signing in…" : "Continue with Google"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/" className="underline hover:text-foreground">
                Back to website
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;

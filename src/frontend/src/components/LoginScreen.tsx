import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Stock Calculation Sheet</h1>
          <p className="text-muted-foreground">Sign in to access your stock sheet</p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          size="lg"
          className="min-w-[200px]"
        >
          {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
        </Button>
      </div>
    </div>
  );
}

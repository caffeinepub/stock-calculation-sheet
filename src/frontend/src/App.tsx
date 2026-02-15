import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginScreen from './components/LoginScreen';
import StockSheetPage from './pages/StockSheetPage';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <StockSheetPage />;
}

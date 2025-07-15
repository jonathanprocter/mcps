import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Dashboard } from '@/components/Dashboard';
import Home from '@/pages/Home';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/home" component={Home} />
            </Switch>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
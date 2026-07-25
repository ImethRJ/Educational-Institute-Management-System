import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { ShieldCheck, Moon, Sun, Lock, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@Sector2026');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Invalid username or password. Account will lock after 5 failed attempts.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background transition-colors duration-200">
      {/* Top Header bar with Theme Toggle */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-2 font-bold text-lg text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xl">
            S
          </div>
          <span>SECTOR INSTITUTE</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-border">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin System Login</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Internal Administration Portal for Sector Institute (Sri Lanka)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md border border-rose-200 dark:border-rose-900">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Username or Email</label>
                <Input
                  type="text"
                  placeholder="admin@sector.lk"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  'Sign In to System'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-xs text-muted-foreground border-t border-border pt-4">
            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Secured with Argon2id & Rate Limiting</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        © 2026 Sector Educational Institute (Private) Ltd, Sri Lanka. Internal System Only.
      </div>
    </div>
  );
};

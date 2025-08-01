import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = mode === 'login' 
        ? await apiClient.login(email, password)
        : await apiClient.register(email, password);

      if (response.success) {
        toast({
          title: "Success!",
          description: mode === 'login' ? "Welcome back!" : "Account created successfully!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      mode={mode}
      onSubmit={handleAuth}
      onToggleMode={() => setMode(mode === 'login' ? 'register' : 'login')}
      isLoading={isLoading}
    />
  );
}
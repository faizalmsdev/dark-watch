import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Monitor, ArrowLeft, Globe, Clock, Type } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewJob() {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    check_interval_minutes: 5
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Job name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (formData.check_interval_minutes < 1) {
      newErrors.check_interval_minutes = 'Check interval must be at least 1 minute';
    } else if (formData.check_interval_minutes > 1440) {
      newErrors.check_interval_minutes = 'Check interval cannot exceed 1440 minutes (24 hours)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await apiClient.createJob(
        formData.name,
        formData.url,
        formData.check_interval_minutes
      );

      if (response.success) {
        toast({
          title: "Job Created!",
          description: `${formData.name} has been created successfully.`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Monitor className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Create New Job</h1>
                <p className="text-sm text-muted-foreground">Set up website monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-card border-border shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Job Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., My Website Monitor"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={cn(
                    "bg-input border-border focus:border-primary focus:ring-primary/20",
                    errors.name && "border-destructive focus:border-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Give your monitoring job a descriptive name
                </p>
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label htmlFor="url" className="text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={cn(
                    "bg-input border-border focus:border-primary focus:ring-primary/20",
                    errors.url && "border-destructive focus:border-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter the complete URL including http:// or https://
                </p>
              </div>

              {/* Check Interval */}
              <div className="space-y-2">
                <Label htmlFor="interval" className="text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Check Interval (minutes)
                </Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="1440"
                  placeholder="5"
                  value={formData.check_interval_minutes}
                  onChange={(e) => handleInputChange('check_interval_minutes', parseInt(e.target.value) || 1)}
                  className={cn(
                    "bg-input border-border focus:border-primary focus:ring-primary/20",
                    errors.check_interval_minutes && "border-destructive focus:border-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.check_interval_minutes && (
                  <p className="text-sm text-destructive">{errors.check_interval_minutes}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  How often to check for changes (1-1440 minutes)
                </p>
              </div>

              {/* Preview */}
              <Card className="p-4 bg-muted/50 border-border">
                <h3 className="font-medium text-foreground mb-2">Job Preview</h3>
                <div className="space-y-1 text-sm">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Name:</span> {formData.name || 'Untitled Job'}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">URL:</span> {formData.url || 'No URL specified'}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Check every:</span> {formData.check_interval_minutes} minutes
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
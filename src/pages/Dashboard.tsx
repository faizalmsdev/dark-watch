import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JobCard } from "@/components/JobCard";
import { apiClient, Job, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Monitor, LogOut, Activity, TrendingUp, Clock } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileResponse, jobsResponse] = await Promise.all([
        apiClient.getProfile(),
        apiClient.getJobs()
      ]);

      if (profileResponse.success) {
        setUser(profileResponse.user);
      }

      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try logging in again.",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      navigate('/auth');
    } catch (error) {
      // Still navigate even if logout fails
      navigate('/auth');
    }
  };

  const handleJobAction = async (action: string, jobId: string) => {
    try {
      let response;
      switch (action) {
        case 'start':
          response = await apiClient.startJob(jobId);
          break;
        case 'pause':
          response = await apiClient.pauseJob(jobId);
          break;
        case 'stop':
          response = await apiClient.stopJob(jobId);
          break;
        case 'delete':
          if (!confirm('Are you sure you want to delete this job?')) return;
          response = await apiClient.deleteJob(jobId);
          break;
        default:
          return;
      }

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || `Job ${action}ed successfully`,
        });
        loadData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} job`,
        variant: "destructive",
      });
    }
  };

  const handleViewResults = (jobId: string) => {
    navigate(`/jobs/${jobId}/results`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Monitor className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const runningJobs = jobs.filter(job => job.status === 'running').length;
  const totalChanges = jobs.reduce((sum, job) => sum + job.changes_detected, 0);
  const totalChecks = jobs.reduce((sum, job) => sum + job.total_checks, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Monitor className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dark Watch</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/jobs/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Job
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{jobs.length}</div>
                <div className="text-sm text-muted-foreground">Total Jobs</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/20 rounded-full">
                <Activity className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{runningJobs}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalChanges}</div>
                <div className="text-sm text-muted-foreground">Changes Detected</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/20 rounded-full">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalChecks}</div>
                <div className="text-sm text-muted-foreground">Total Checks</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Jobs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Monitoring Jobs</h2>
            {jobs.length > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate('/jobs/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Job
              </Button>
            )}
          </div>

          {jobs.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-card border-border">
              <Monitor className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No monitoring jobs yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first monitoring job to start tracking website changes
              </p>
              <Button
                onClick={() => navigate('/jobs/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Job
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onStart={(id) => handleJobAction('start', id)}
                  onPause={(id) => handleJobAction('pause', id)}
                  onStop={(id) => handleJobAction('stop', id)}
                  onDelete={(id) => handleJobAction('delete', id)}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
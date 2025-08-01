import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient, JobResult, Job } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, ExternalLink, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobResults() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [results, setResults] = useState<JobResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId]);

  const loadData = async () => {
    if (!jobId) return;

    try {
      const [jobResponse, resultsResponse] = await Promise.all([
        apiClient.getJob(jobId),
        apiClient.getJobResults(jobId, 50)
      ]);

      if (jobResponse.success) {
        setJob(jobResponse.job);
      }

      if (resultsResponse.success) {
        setResults(resultsResponse.results);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job results",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getChangeTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'content_change':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'structure_change':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{job.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {job.url}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {formatDate(job.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-border">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{results.length}</div>
              <div className="text-sm text-muted-foreground">Total Changes</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-border">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">{job.total_checks}</div>
              <div className="text-sm text-muted-foreground">Total Checks</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-border">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">{job.check_interval_minutes}m</div>
              <div className="text-sm text-muted-foreground">Check Interval</div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Change History</h2>
          
          {results.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-card border-border">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No changes detected yet</h3>
              <p className="text-muted-foreground">
                This job hasn't detected any changes. Results will appear here when changes are found.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card 
                  key={index} 
                  className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className={cn("text-xs", getChangeTypeColor(result.type))}>
                            {result.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(result.detected_at)}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground">{result.description}</h3>
                      </div>
                    </div>

                    {/* Content Changes */}
                    {(result.old_content || result.new_content) && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {result.old_content && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-destructive">Before</h4>
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
                              <code className="text-destructive break-all">{result.old_content}</code>
                            </div>
                          </div>
                        )}
                        
                        {result.new_content && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-success">After</h4>
                            <div className="p-3 bg-success/10 border border-success/20 rounded-md text-sm">
                              <code className="text-success break-all">{result.new_content}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Analysis */}
                    {result.ai_analysis && (
                      <div className="space-y-3 p-4 bg-muted/20 border border-border rounded-md">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          AI Analysis
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">{result.ai_analysis.summary}</p>
                          
                          {result.ai_analysis.companies && result.ai_analysis.companies.length > 0 && (
                            <div>
                              <span className="font-medium text-foreground">Companies mentioned: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.ai_analysis.companies.map((company, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {company}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {result.ai_analysis.new_companies_detected && (
                            <div className="flex items-center gap-2 text-warning">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">New companies detected!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
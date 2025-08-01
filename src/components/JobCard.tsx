import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Job } from "@/lib/api";
import { Play, Pause, Square, Trash2, Eye, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onStart: (jobId: string) => void;
  onPause: (jobId: string) => void;
  onStop: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onViewResults: (jobId: string) => void;
  className?: string;
}

export function JobCard({ 
  job, 
  onStart, 
  onPause, 
  onStop, 
  onDelete, 
  onViewResults,
  className 
}: JobCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getActionButtons = () => {
    switch (job.status) {
      case 'created':
      case 'stopped':
        return (
          <Button
            size="sm"
            variant="success"
            onClick={() => onStart(job.job_id)}
            className="flex-1"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
        );
      case 'running':
        return (
          <>
            <Button
              size="sm"
              variant="warning"
              onClick={() => onPause(job.job_id)}
              className="flex-1"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStop(job.job_id)}
              className="flex-1"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </>
        );
      case 'paused':
        return (
          <>
            <Button
              size="sm"
              variant="success"
              onClick={() => onStart(job.job_id)}
              className="flex-1"
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStop(job.job_id)}
              className="flex-1"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </>
        );
      case 'error':
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onStart(job.job_id)}
            className="flex-1"
          >
            <Play className="w-4 h-4" />
            Retry
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-card border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300",
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground">{job.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors truncate max-w-[200px]"
              >
                {job.url}
              </a>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{job.total_checks}</div>
            <div className="text-xs text-muted-foreground">Checks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">{job.changes_detected}</div>
            <div className="text-xs text-muted-foreground">Changes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">{job.check_interval_minutes}m</div>
            <div className="text-xs text-muted-foreground">Interval</div>
          </div>
        </div>

        {/* Last Check */}
        <div className="text-sm text-muted-foreground">
          Last check: {formatDate(job.last_check)}
        </div>

        {/* Error Message */}
        {job.error_message && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            {job.error_message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {getActionButtons()}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewResults(job.job_id)}
            disabled={job.changes_detected === 0}
          >
            <Eye className="w-4 h-4" />
            Results
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(job.job_id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
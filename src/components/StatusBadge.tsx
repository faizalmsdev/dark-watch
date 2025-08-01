import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'created' | 'running' | 'paused' | 'stopped' | 'error';
  className?: string;
}

const statusConfig = {
  created: {
    label: 'Created',
    className: 'bg-muted text-muted-foreground border-muted-foreground',
    dot: 'bg-muted-foreground'
  },
  running: {
    label: 'Running',
    className: 'bg-status-running/20 text-status-running border-status-running',
    dot: 'bg-status-running animate-pulse'
  },
  paused: {
    label: 'Paused',
    className: 'bg-status-paused/20 text-status-paused border-status-paused',
    dot: 'bg-status-paused'
  },
  stopped: {
    label: 'Stopped',
    className: 'bg-status-stopped/20 text-status-stopped border-status-stopped',
    dot: 'bg-status-stopped'
  },
  error: {
    label: 'Error',
    className: 'bg-status-error/20 text-status-error border-status-error',
    dot: 'bg-status-error animate-pulse'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300",
      config.className,
      className
    )}>
      <div className={cn("w-2 h-2 rounded-full", config.dot)} />
      {config.label}
    </div>
  );
}
import { LogLevel } from '@flagsync/react-sdk';
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Laptop } from 'lucide-react';

import { logger } from '@/lib/logger';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const CardLogViewer = () => {
  const logs = useSyncExternalStore(logger.subscribe, logger.getSnapshot);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');

  const filteredLogs = (
    filter === 'ALL' ? logs : logs.filter((log) => log.level === filter)
  )
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'DEBUG':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'WARN':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Laptop className="text-emerald-400" />
          <span className="font-mono">Log Viewer</span>
        </CardTitle>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as LogLevel | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="DEBUG">Debug</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
            <SelectItem value="WARN">Warning</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
            <SelectItem value="NONE">None</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="rounded-md border" style={{ height: 500 }}>
          <div className="p-4 font-mono text-sm">
            {filteredLogs.length > 0 ? (
              <div className="grid grid-cols-[150px_auto_2fr] gap-x-4 gap-y-2 items-start">
                {/* Header */}
                <div className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Timestamp
                </div>
                <div className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Level
                </div>
                <div className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Message
                </div>

                {/* Log entries */}
                {filteredLogs.map((log, index) => {
                  return (
                    <Fragment key={`${index}-${log.timestamp}`}>
                      <div className="text-xs text-muted-foreground self-center">
                        {formatTimestamp(log.timestamp)}
                      </div>
                      <div key={`${index}-level`} className="flex items-center">
                        <Badge
                          variant="outline"
                          className={`${getLogLevelColor(log.level)} text-xs`}
                        >
                          {log.level}
                        </Badge>
                      </div>
                      <div
                        key={`${index}-message`}
                        className="break-words self-center"
                      >
                        {log.message}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No logs to display
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

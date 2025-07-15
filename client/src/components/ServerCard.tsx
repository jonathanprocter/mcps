import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MCPServer } from "@shared/schema";
import { Activity, AlertCircle, CheckCircle, Clock, Play, Settings } from "lucide-react";

interface ServerCardProps {
  server: MCPServer;
  onTest: (serverName: string) => void;
  onConfigure: (serverName: string) => void;
  onViewTools: (serverName: string) => void;
}

export function ServerCard({ server, onTest, onConfigure, onViewTools }: ServerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'testing':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'testing':
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getAuthStatusColor = (authStatus?: string) => {
    switch (authStatus) {
      case 'authenticated':
        return 'success';
      case 'unauthenticated':
        return 'warning';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg capitalize">{server.name}</CardTitle>
            <CardDescription className="mt-1">{server.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(server.status)}
            <Badge variant={getStatusColor(server.status)}>
              {server.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Tools</p>
            <p className="font-medium">{server.tools.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Requests</p>
            <p className="font-medium">{server.requestCount || 0}</p>
          </div>
          {server.averageResponseTime && (
            <div>
              <p className="text-muted-foreground">Avg Response</p>
              <p className="font-medium">{server.averageResponseTime}ms</p>
            </div>
          )}
          {server.errorCount !== undefined && (
            <div>
              <p className="text-muted-foreground">Errors</p>
              <p className="font-medium">{server.errorCount}</p>
            </div>
          )}
        </div>

        {server.authStatus && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Auth:</span>
            <Badge variant={getAuthStatusColor(server.authStatus)} className="text-xs">
              {server.authStatus}
            </Badge>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => onTest(server.name)}
            disabled={server.status === 'testing'}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Test Server
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewTools(server.name)}
            className="flex-1"
          >
            View Tools
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConfigure(server.name)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
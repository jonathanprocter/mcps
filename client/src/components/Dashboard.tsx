import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServerCard } from "./ServerCard";
import { ToolTester } from "./ToolTester";
import { ApiKeyManager } from "./ApiKeyManager";
import { DeploymentManager } from "./DeploymentManager";
import { MCPServer, MCPResponse, HealthCheck } from "@shared/schema";
import { 
  Activity, 
  Server, 
  Shield, 
  Settings, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [showDeploymentManager, setShowDeploymentManager] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch servers
  const { data: servers = [], isLoading: isLoadingServers, refetch: refetchServers } = useQuery({
    queryKey: ['/api/servers'],
    queryFn: async () => {
      const response = await fetch('/api/servers');
      if (!response.ok) throw new Error('Failed to fetch servers');
      return response.json() as MCPServer[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch health status
  const { data: healthCheck } = useQuery({
    queryKey: ['/api/health'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Failed to fetch health');
      return response.json() as HealthCheck;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch tools for selected server
  const { data: tools = [] } = useQuery({
    queryKey: ['/api/servers', selectedServer, 'tools'],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${selectedServer}/tools`);
      if (!response.ok) throw new Error('Failed to fetch tools');
      return response.json() as string[];
    },
    enabled: !!selectedServer,
  });

  // Execute tool mutation
  const executeTool = useMutation({
    mutationFn: async ({ server, tool, input }: { server: string; tool: string; input: string }) => {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server, tool, input }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute tool');
      }
      
      return response.json() as MCPResponse;
    },
    onSuccess: () => {
      // Invalidate and refetch servers to update stats
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
    },
  });

  // Test server mutation
  const testServer = useMutation({
    mutationFn: async (serverName: string) => {
      const response = await fetch(`/api/servers/${serverName}/test`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test server');
      }
      
      return response.json();
    },
    onSuccess: (data, serverName) => {
      toast({
        title: "Server Test Complete",
        description: `${serverName} server test completed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
    },
    onError: (error, serverName) => {
      toast({
        title: "Server Test Failed",
        description: `${serverName} server test failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleTestServer = (serverName: string) => {
    testServer.mutate(serverName);
  };

  const handleViewTools = (serverName: string) => {
    setSelectedServer(serverName);
  };

  const handleExecuteTool = async (server: string, tool: string, input: string): Promise<MCPResponse> => {
    const result = await executeTool.mutateAsync({ server, tool, input });
    return result;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalRequests = servers.reduce((sum, s) => sum + (s.requestCount || 0), 0);
  const totalErrors = servers.reduce((sum, s) => sum + (s.errorCount || 0), 0);
  const averageResponseTime = servers.reduce((sum, s) => sum + (s.averageResponseTime || 0), 0) / servers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Server Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your Model Context Protocol servers</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowDeploymentManager(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Deploy
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowApiKeyManager(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            API Keys
          </Button>
          <Button
            variant="outline"
            onClick={() => refetchServers()}
            disabled={isLoadingServers}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingServers ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      {healthCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                {getHealthStatusIcon(healthCheck.status)}
                <div>
                  <p className="text-sm font-medium">Overall Status</p>
                  <Badge variant={getHealthStatusColor(healthCheck.status)}>
                    {healthCheck.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Server className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Online Servers</p>
                  <p className="text-2xl font-bold">{onlineServers}/{servers.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Total Requests</p>
                  <p className="text-2xl font-bold">{totalRequests}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Avg Response</p>
                  <p className="text-2xl font-bold">{averageResponseTime.toFixed(0)}ms</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Servers Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">MCP Servers</h2>
        {isLoadingServers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <ServerCard
                key={server.name}
                server={server}
                onTest={handleTestServer}
                onConfigure={() => setShowApiKeyManager(true)}
                onViewTools={handleViewTools}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tool Tester Modal */}
      {selectedServer && (
        <ToolTester
          serverName={selectedServer}
          tools={tools}
          onExecute={handleExecuteTool}
          onClose={() => setSelectedServer(null)}
        />
      )}

      {/* API Key Manager Modal */}
      {showApiKeyManager && (
        <ApiKeyManager onClose={() => setShowApiKeyManager(false)} />
      )}

      {/* Deployment Manager Modal */}
      {showDeploymentManager && (
        <DeploymentManager onClose={() => setShowDeploymentManager(false)} />
      )}
    </div>
  );
}
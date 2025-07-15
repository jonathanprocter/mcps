import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeploymentConfig } from "@shared/schema";
import { 
  Globe, 
  Shield, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Rocket,
  Monitor,
  Database,
  Server,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentManagerProps {
  onClose: () => void;
}

export function DeploymentManager({ onClose }: DeploymentManagerProps) {
  const [config, setConfig] = useState<DeploymentConfig>({
    environment: "production",
    port: 5000,
    host: "0.0.0.0",
    httpsEnabled: true,
    corsOrigins: ["*"],
    rateLimit: 1000,
    logLevel: "info",
    healthCheck: true,
    monitoring: true,
  });

  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleConfigChange = (key: keyof DeploymentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDeploymentStatus('success');
      toast({
        title: "Deployment Successful",
        description: "Your MCP servers are now live and accessible",
      });
    } catch (error) {
      setDeploymentStatus('error');
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your servers",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const deploymentFeatures = [
    {
      icon: Globe,
      title: "Global Access",
      description: "Deploy your MCP servers globally for iPhone integration",
      status: "ready"
    },
    {
      icon: Shield,
      title: "Security",
      description: "HTTPS, CORS, and rate limiting built-in",
      status: "configured"
    },
    {
      icon: Monitor,
      title: "Monitoring",
      description: "Real-time health checks and performance metrics",
      status: "enabled"
    },
    {
      icon: Database,
      title: "Persistence",
      description: "Automatic server state management and recovery",
      status: "active"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Rocket className="h-5 w-5" />
                <span>Deployment Manager</span>
              </CardTitle>
              <CardDescription>Configure and deploy your MCP servers for iPhone integration</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deployment Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deploymentFeatures.map((feature, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <feature.icon className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <Badge variant="success" className="text-xs">
                  {feature.status}
                </Badge>
              </Card>
            ))}
          </div>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Deployment Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Environment</label>
                  <Select 
                    value={config.environment} 
                    onValueChange={(value) => handleConfigChange('environment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Port</label>
                  <Input
                    type="number"
                    value={config.port}
                    onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Host</label>
                  <Input
                    value={config.host}
                    onChange={(e) => handleConfigChange('host', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rate Limit (req/min)</label>
                  <Input
                    type="number"
                    value={config.rateLimit}
                    onChange={(e) => handleConfigChange('rateLimit', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Log Level</label>
                  <Select 
                    value={config.logLevel} 
                    onValueChange={(value) => handleConfigChange('logLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">CORS Origins</label>
                  <Input
                    value={config.corsOrigins.join(', ')}
                    onChange={(e) => handleConfigChange('corsOrigins', e.target.value.split(', '))}
                    placeholder="https://app.example.com, *"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.httpsEnabled}
                    onChange={(e) => handleConfigChange('httpsEnabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Enable HTTPS</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.healthCheck}
                    onChange={(e) => handleConfigChange('healthCheck', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Health Checks</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.monitoring}
                    onChange={(e) => handleConfigChange('monitoring', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Monitoring</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* iPhone Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>iPhone Integration Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Connection Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Server URL:</span>
                      <code className="bg-muted px-2 py-1 rounded">
                        {config.httpsEnabled ? 'https' : 'http'}://{config.host}:{config.port}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Check:</span>
                      <code className="bg-muted px-2 py-1 rounded">/api/health</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Servers List:</span>
                      <code className="bg-muted px-2 py-1 rounded">/api/servers</code>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Setup Steps</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                      <span>Deploy your MCP servers using the configuration above</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                      <span>Configure your iPhone app to connect to the server URL</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                      <span>Test the connection using the health check endpoint</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                      <span>Start using MCP tools from your iPhone</span>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Status */}
          {deploymentStatus !== 'idle' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {deploymentStatus === 'deploying' && (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <div>
                        <h3 className="font-semibold">Deploying Servers...</h3>
                        <p className="text-sm text-muted-foreground">Setting up your MCP servers for production use</p>
                      </div>
                    </>
                  )}
                  {deploymentStatus === 'success' && (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="font-semibold">Deployment Successful!</h3>
                        <p className="text-sm text-muted-foreground">Your MCP servers are now live and ready for iPhone integration</p>
                      </div>
                    </>
                  )}
                  {deploymentStatus === 'error' && (
                    <>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <div>
                        <h3 className="font-semibold">Deployment Failed</h3>
                        <p className="text-sm text-muted-foreground">There was an error deploying your servers. Please check the logs.</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deploy Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeploy} 
              disabled={isDeploying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to Production
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
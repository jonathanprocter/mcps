import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APIKey } from "@shared/schema";
import { Eye, EyeOff, Save, TestTube, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyManagerProps {
  onClose: () => void;
}

export function ApiKeyManager({ onClose }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with required API keys
    const requiredKeys: APIKey[] = [
      {
        service: "google",
        name: "GOOGLE_CLIENT_ID",
        required: true,
        configured: !!process.env.GOOGLE_CLIENT_ID,
        status: "untested",
      },
      {
        service: "google",
        name: "GOOGLE_CLIENT_SECRET",
        required: true,
        configured: !!process.env.GOOGLE_CLIENT_SECRET,
        status: "untested",
      },
      {
        service: "google",
        name: "GOOGLE_REFRESH_TOKEN",
        required: true,
        configured: !!process.env.GOOGLE_REFRESH_TOKEN,
        status: "untested",
      },
      {
        service: "dropbox",
        name: "DROPBOX_ACCESS_TOKEN",
        required: true,
        configured: !!process.env.DROPBOX_ACCESS_TOKEN,
        status: "untested",
      },
      {
        service: "notion",
        name: "NOTION_INTEGRATION_SECRET",
        required: true,
        configured: !!process.env.NOTION_INTEGRATION_SECRET,
        status: "untested",
      },
      {
        service: "notion",
        name: "NOTION_PAGE_URL",
        required: false,
        configured: !!process.env.NOTION_PAGE_URL,
        status: "untested",
      },
      {
        service: "openai",
        name: "OPENAI_API_KEY",
        required: true,
        configured: !!process.env.OPENAI_API_KEY,
        status: "untested",
      },
      {
        service: "perplexity",
        name: "PERPLEXITY_API_KEY",
        required: true,
        configured: !!process.env.PERPLEXITY_API_KEY,
        status: "untested",
      },
    ];

    setApiKeys(requiredKeys);
  }, []);

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const handleKeyChange = (keyName: string, value: string) => {
    setKeyValues(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const saveApiKey = async (keyName: string) => {
    const value = keyValues[keyName];
    if (!value || !value.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApiKeys(prev => prev.map(key => 
        key.name === keyName 
          ? { ...key, configured: true, status: "valid" as const, lastVerified: new Date().toISOString() }
          : key
      ));

      toast({
        title: "Success",
        description: `${keyName} saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (keyName: string) => {
    setIsLoading(true);
    try {
      // In a real app, you would test the API key
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isValid = Math.random() > 0.3; // Simulate success/failure
      
      setApiKeys(prev => prev.map(key => 
        key.name === keyName 
          ? { 
              ...key, 
              status: isValid ? "valid" as const : "invalid" as const,
              lastVerified: new Date().toISOString()
            }
          : key
      ));

      toast({
        title: isValid ? "Success" : "Error",
        description: `${keyName} is ${isValid ? "valid" : "invalid"}`,
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'invalid':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const groupedKeys = apiKeys.reduce((acc, key) => {
    if (!acc[key.service]) {
      acc[key.service] = [];
    }
    acc[key.service].push(key);
    return acc;
  }, {} as Record<string, APIKey[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Configure and test your API keys for MCP servers</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedKeys).map(([service, keys]) => (
            <div key={service} className="space-y-4">
              <h3 className="text-lg font-semibold capitalize">{service} Service</h3>
              <div className="space-y-4">
                {keys.map((apiKey) => (
                  <Card key={apiKey.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{apiKey.name}</span>
                        {apiKey.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {apiKey.configured && (
                          <Badge variant="success" className="text-xs">Configured</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(apiKey.status || 'untested')}
                        <Badge variant={getStatusColor(apiKey.status || 'untested')}>
                          {apiKey.status || 'untested'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          type={showKeys[apiKey.name] ? "text" : "password"}
                          placeholder={`Enter ${apiKey.name}`}
                          value={keyValues[apiKey.name] || ""}
                          onChange={(e) => handleKeyChange(apiKey.name, e.target.value)}
                        />
                        <button
                          onClick={() => toggleShowKey(apiKey.name)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          {showKeys[apiKey.name] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        onClick={() => saveApiKey(apiKey.name)}
                        disabled={isLoading || !keyValues[apiKey.name]?.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => testApiKey(apiKey.name)}
                        disabled={isLoading || !apiKey.configured}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>
                    
                    {apiKey.lastVerified && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Last verified: {new Date(apiKey.lastVerified).toLocaleString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
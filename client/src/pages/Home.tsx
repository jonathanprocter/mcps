import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Send, Trash2, Loader2, MessageSquare, Server, Settings } from 'lucide-react';

interface MCPServer {
  name: string;
  status: 'online' | 'offline' | 'error';
  description: string;
  tools: string[];
  lastUsed?: string;
}

interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  server: string;
  tool: string;
  timestamp: string;
}

export default function Home() {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [responses, setResponses] = useState<MCPResponse[]>([]);
  const { toast } = useToast();

  // Get available servers
  const { data: servers = [], isLoading: serversLoading } = useQuery<MCPServer[]>({
    queryKey: ['/api/servers'],
    queryFn: async () => {
      const response = await fetch('/api/servers');
      if (!response.ok) throw new Error('Failed to fetch servers');
      return response.json();
    },
  });

  // Get tools for selected server
  const { data: tools = [] } = useQuery<string[]>({
    queryKey: ['/api/tools', selectedServer],
    queryFn: async () => {
      if (!selectedServer) return [];
      const response = await fetch(`/api/servers/${selectedServer}/tools`);
      if (!response.ok) throw new Error('Failed to fetch tools');
      return response.json();
    },
    enabled: !!selectedServer,
  });

  // Execute MCP tool
  const executeTool = useMutation({
    mutationFn: async (params: { server: string; tool: string; input: string }) => {
      const response = await apiRequest(`/api/execute`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return response;
    },
    onSuccess: (data) => {
      const newResponse: MCPResponse = {
        success: true,
        data: data.result,
        server: selectedServer,
        tool: selectedTool,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => [newResponse, ...prev]);
      toast({
        title: 'Success',
        description: `Tool executed successfully`,
      });
    },
    onError: (error: any) => {
      const errorResponse: MCPResponse = {
        success: false,
        error: error.message || 'Unknown error occurred',
        server: selectedServer,
        tool: selectedTool,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => [errorResponse, ...prev]);
      toast({
        title: 'Error',
        description: error.message || 'Failed to execute tool',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    if (!inputMessage.trim() || !selectedServer || !selectedTool) {
      toast({
        title: 'Missing Information',
        description: 'Please select a server, tool, and enter a message',
        variant: 'destructive',
      });
      return;
    }

    executeTool.mutate({
      server: selectedServer,
      tool: selectedTool,
      input: inputMessage.trim(),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Response copied to clipboard',
    });
  };

  const clearResponses = () => {
    setResponses([]);
    toast({
      title: 'Cleared',
      description: 'All responses cleared',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            MCP Tool Interface
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Connect and interact with your Model Context Protocol tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Server Status Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Available Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serversLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : servers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No servers available</p>
                ) : (
                  servers.map((server) => (
                    <div
                      key={server.name}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedServer === server.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedServer(server.name);
                        setSelectedTool('');
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{server.name}</span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {server.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {server.tools.slice(0, 3).map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {server.tools.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{server.tools.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Tool Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Tool Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="server-select">Selected Server</Label>
                    <Select value={selectedServer} onValueChange={setSelectedServer}>
                      <SelectTrigger id="server-select">
                        <SelectValue placeholder="Choose a server" />
                      </SelectTrigger>
                      <SelectContent>
                        {servers.map((server) => (
                          <SelectItem key={server.name} value={server.name}>
                            {server.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tool-select">Available Tools</Label>
                    <Select value={selectedTool} onValueChange={setSelectedTool} disabled={!selectedServer}>
                      <SelectTrigger id="tool-select">
                        <SelectValue placeholder="Choose a tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {tools.map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Input Area */}
                <div>
                  <Label htmlFor="message-input">Message</Label>
                  <Textarea
                    id="message-input"
                    placeholder="Enter your prompt, command, or question here..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={2000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {inputMessage.length} / 2000
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputMessage('')}
                        disabled={!inputMessage}
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!inputMessage.trim() || !selectedServer || !selectedTool || executeTool.isPending}
                        size="sm"
                      >
                        {executeTool.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response History */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response History</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearResponses}
                disabled={responses.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No responses yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start by selecting a server and tool above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      response.success
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={response.success ? 'default' : 'destructive'}>
                          {response.server}
                        </Badge>
                        <Badge variant="outline">{response.tool}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(response.timestamp).toLocaleTimeString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(response.data || response.error || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <pre className="text-sm bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto">
                      {response.success ? response.data : response.error}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
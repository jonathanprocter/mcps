import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MCPResponse } from "@shared/schema";
import { Play, Copy, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToolTesterProps {
  serverName: string;
  tools: string[];
  onExecute: (server: string, tool: string, input: string) => Promise<MCPResponse>;
  onClose: () => void;
}

export function ToolTester({ serverName, tools, onExecute, onClose }: ToolTesterProps) {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<MCPResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExecute = async () => {
    if (!selectedTool || !input.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a tool and provide input",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await onExecute(serverName, selectedTool, input);
      setResponse(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${selectedTool} executed successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Tool execution failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute tool",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Response copied to clipboard",
    });
  };

  const getToolExamples = (tool: string) => {
    const examples: Record<string, string[]> = {
      search_emails: ['Search for emails about project updates', 'Find emails from john@example.com'],
      send_email: ['Send email to team@example.com with subject "Meeting Update"'],
      list_files: ['List all files in the root directory', 'Show files in "Documents" folder'],
      upload_file: ['Upload file named "report.pdf" with content "Sample report"'],
      create_event: ['Create meeting tomorrow at 2 PM about project review'],
      search_pages: ['Search for pages about project documentation'],
      chat_completion: ['Explain quantum computing in simple terms'],
      generate_image: ['Generate an image of a sunset over mountains'],
      scrape_page: ['Extract content from https://example.com'],
      research_topic: ['Research the latest trends in AI technology'],
    };
    return examples[tool] || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="capitalize">{serverName} Tool Tester</CardTitle>
              <CardDescription>Test tools and see responses in real-time</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Tool</label>
                <Select value={selectedTool} onValueChange={setSelectedTool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tool to test" />
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

              {selectedTool && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Examples</label>
                  <div className="space-y-2">
                    {getToolExamples(selectedTool).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(example)}
                        className="text-left p-2 text-sm bg-muted rounded hover:bg-muted/80 w-full"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Input</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your input here..."
                  className="min-h-32"
                />
              </div>

              <Button
                onClick={handleExecute}
                disabled={isLoading || !selectedTool || !input.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Tool
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Response</label>
                {response && (
                  <div className="flex items-center space-x-2">
                    <Badge variant={response.success ? "success" : "destructive"}>
                      {response.success ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {response.success ? "Success" : "Error"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {response ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">
                      Server: {response.server} | Tool: {response.tool}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Time: {new Date(response.timestamp).toLocaleTimeString()}
                      {response.responseTime && ` | Response Time: ${response.responseTime}ms`}
                    </div>
                    
                    {response.success ? (
                      <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded border">
                        Error: {response.error}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No response yet. Execute a tool to see results.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Wifi, WifiOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIPTVContext } from "@/contexts/IPTVContext";

const IPTVSettings = () => {
  const { iptvCredentials, iptvConnected, setIPTVCredentials, testIPTV } = useIPTVContext();
  
  const [serverUrl, setServerUrl] = useState(iptvCredentials?.serverUrl || "");
  const [username, setUsername] = useState(iptvCredentials?.username || "");
  const [password, setPassword] = useState(iptvCredentials?.password || "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    if (serverUrl && username && password) {
      setIPTVCredentials({ serverUrl, username, password });
      setTestResult(null);
    }
  };

  const handleTest = async () => {
    if (!serverUrl || !username || !password) {
      setTestResult({ success: false, message: "Please fill in all fields" });
      return;
    }

    // Save first, then test
    setIPTVCredentials({ serverUrl, username, password });
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testIPTV();
      setTestResult({
        success: result.success,
        message: result.success ? "Connected successfully!" : result.error || "Connection failed",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setServerUrl("");
    setUsername("");
    setPassword("");
    setIPTVCredentials(null);
    setTestResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/70 uppercase tracking-wider">
        {iptvConnected ? (
          <Wifi className="w-4 h-4 text-green-500" strokeWidth={1.5} />
        ) : (
          <WifiOff className="w-4 h-4" strokeWidth={1.5} />
        )}
        <span>IPTV Connection</span>
        {iptvConnected && (
          <span className="text-xs text-green-500 normal-case font-normal">Connected</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="iptv-server" className="text-sm text-foreground/80">
            Server URL
          </Label>
          <Input
            id="iptv-server"
            type="url"
            placeholder="http://provider.com:8080"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="bg-secondary/50 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            Your IPTV provider's server address (e.g., http://example.com:8080)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="iptv-username" className="text-sm text-foreground/80">
            Username
          </Label>
          <Input
            id="iptv-username"
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-secondary/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="iptv-password" className="text-sm text-foreground/80">
            Password
          </Label>
          <Input
            id="iptv-password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary/50 border-border/50"
          />
        </div>

        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              testResult.success
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleTest}
            disabled={isTesting || !serverUrl || !username || !password}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isTesting}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IPTVSettings;

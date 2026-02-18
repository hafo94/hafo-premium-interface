import { useState } from "react";
import { Wifi, WifiOff, Loader2, CheckCircle, XCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIPTVContext } from "@/contexts/IPTVContext";
import { useToast } from "@/hooks/use-toast";

const IPTVSettings = () => {
  const { iptvCredentials, iptvConnected, setIPTVCredentials, testIPTV } = useIPTVContext();
  const { toast } = useToast();

  const [serverUrl, setServerUrl] = useState(iptvCredentials?.serverUrl || "");
  const [username, setUsername] = useState(iptvCredentials?.username || "");
  const [password, setPassword] = useState(iptvCredentials?.password || "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; statusCode?: number } | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const diagnosticUrl = serverUrl && username
    ? `${serverUrl.replace(/\/$/, '')}/player_api.php?username=${encodeURIComponent(username)}&password=***&action=get_user_info`
    : null;

  const getStatusHint = (statusCode?: number) => {
    if (!statusCode) return null;
    if (statusCode === 404) return "404 = Wrong server URL or path. Check your provider's server address.";
    if (statusCode === 401 || statusCode === 403) return "401/403 = Invalid username or password.";
    if (statusCode === 0 || statusCode >= 500) return "Server unreachable. Check your server URL.";
    return null;
  };

  const handleTest = async () => {
    if (!serverUrl || !username || !password) {
      setTestResult({ success: false, message: "Please fill in all fields" });
      return;
    }

    setIPTVCredentials({ serverUrl, username, password });
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testIPTV();
      setTestResult({
        success: result.success,
        message: result.success
          ? "Connected successfully!"
          : result.error || "Connection failed",
        statusCode: (result as any).statusCode,
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

  const handleCopyDiagnosticUrl = () => {
    if (!diagnosticUrl) return;
    // Copy with real password for actual testing
    const fullUrl = serverUrl && username && password
      ? `${serverUrl.replace(/\/$/, '')}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_user_info`
      : diagnosticUrl;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: "Copied!", description: "Paste this URL in a browser tab to test your credentials directly." });
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
            className={`space-y-1.5 p-3 rounded-lg text-sm ${
              testResult.success
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
              {testResult.statusCode && (
                <span className="ml-auto font-mono text-xs opacity-70">HTTP {testResult.statusCode}</span>
              )}
            </div>
            {getStatusHint(testResult.statusCode) && (
              <p className="text-xs opacity-80 pl-6">{getStatusHint(testResult.statusCode)}</p>
            )}
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

        {/* Diagnostics Panel */}
        {serverUrl && (
          <div className="pt-1">
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Advanced / Diagnostics
            </button>

            {showDiagnostics && (
              <div className="mt-2 p-3 bg-secondary/30 rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">API Endpoint</p>
                <div className="flex items-start gap-2">
                  <code className="flex-1 text-xs text-foreground/70 break-all leading-relaxed font-mono bg-background/50 rounded p-2">
                    {diagnosticUrl || "Fill in server URL and username above"}
                  </code>
                  {diagnosticUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyDiagnosticUrl}
                      className="flex-shrink-0 h-7 px-2"
                      title="Copy URL with real credentials to test in browser"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this URL (with your real password) and open it in a browser tab to verify your credentials work independently of this app.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IPTVSettings;

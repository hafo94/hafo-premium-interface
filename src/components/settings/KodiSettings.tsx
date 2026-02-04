import { useState } from "react";
import { Monitor, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIPTVContext } from "@/contexts/IPTVContext";

const KodiSettings = () => {
  const { kodiConfig, kodiConnected, setKodiConfig, testKodi } = useIPTVContext();
  
  const [host, setHost] = useState(kodiConfig?.host || "");
  const [port, setPort] = useState(kodiConfig?.port?.toString() || "8080");
  const [username, setUsername] = useState(kodiConfig?.username || "");
  const [password, setPassword] = useState(kodiConfig?.password || "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!host || !port) {
      setTestResult({ success: false, message: "Please fill in host and port" });
      return;
    }

    const portNum = parseInt(port, 10);
    if (isNaN(portNum)) {
      setTestResult({ success: false, message: "Invalid port number" });
      return;
    }

    // Save first, then test
    setKodiConfig({
      host,
      port: portNum,
      username: username || undefined,
      password: password || undefined,
    });

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testKodi();
      setTestResult({
        success: result.success,
        message: result.success
          ? `Connected! Kodi version: ${result.version}`
          : result.error || "Connection failed",
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
    setHost("");
    setPort("8080");
    setUsername("");
    setPassword("");
    setKodiConfig(null);
    setTestResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/70 uppercase tracking-wider">
        <Monitor className="w-4 h-4" strokeWidth={1.5} />
        <span>Kodi Connection</span>
        {kodiConnected && (
          <span className="text-xs text-green-500 normal-case font-normal">Connected</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="kodi-host" className="text-sm text-foreground/80">
              Kodi IP / Hostname
            </Label>
            <Input
              id="kodi-host"
              type="text"
              placeholder="192.168.1.100"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kodi-port" className="text-sm text-foreground/80">
              Port
            </Label>
            <Input
              id="kodi-port"
              type="number"
              placeholder="8080"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Enable "Allow control via HTTP" in Kodi → Settings → Services → Control
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="kodi-username" className="text-sm text-foreground/80">
              Username (optional)
            </Label>
            <Input
              id="kodi-username"
              type="text"
              placeholder="kodi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kodi-password" className="text-sm text-foreground/80">
              Password (optional)
            </Label>
            <Input
              id="kodi-password"
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
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
            disabled={isTesting || !host || !port}
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

export default KodiSettings;

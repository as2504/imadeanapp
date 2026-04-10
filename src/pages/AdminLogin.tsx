import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-auth", {
        body: { key },
      });
      if (fnError || data?.error) {
        setError("Invalid key");
      } else if (data?.token) {
        sessionStorage.setItem("admin_token", data.token);
        navigate("/ctrl-qx-99/panel", { replace: true });
      }
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Restricted Access</h1>
        </div>

        <Input
          type="password"
          placeholder="Enter Master Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="text-center"
          autoFocus
        />

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !key}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authenticate"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;

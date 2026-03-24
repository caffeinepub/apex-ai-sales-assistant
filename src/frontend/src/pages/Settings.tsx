import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

export function SettingsPage() {
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();
  const { identity, login, loginStatus } = useInternetIdentity();
  const [name, setName] = useState("");
  const isLoggedIn = loginStatus === "success" && !!identity;

  const handleSave = async () => {
    const displayName = name.trim() || profile?.name || "";
    if (!displayName) {
      toast.error("Please enter a name.");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: displayName });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg space-y-6"
        >
          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Profile
            </h3>
            {!isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to manage your profile.
                </p>
                <Button
                  data-ocid="settings.login_button"
                  onClick={login}
                  disabled={loginStatus === "logging-in"}
                >
                  {loginStatus === "logging-in" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Sign In
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Display Name
                  </Label>
                  <Input
                    data-ocid="settings.name_input"
                    defaultValue={profile?.name ?? ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Principal ID
                  </Label>
                  <Input
                    disabled
                    value={identity?.getPrincipal().toString() ?? ""}
                    className="bg-background border-border text-muted-foreground text-xs"
                  />
                </div>
                <Button
                  data-ocid="settings.save_button"
                  onClick={handleSave}
                  disabled={saveProfile.isPending || isLoading}
                  className="gap-2"
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Profile
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

interface TopBarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function TopBar({ title, searchValue, onSearchChange }: TopBarProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const displayName = profile?.name ?? (identity ? "User" : null);
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="topbar.search_input"
              placeholder="Search..."
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-56 h-9 bg-background border-border text-sm"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-8 h-8 cursor-pointer border border-border hover:border-primary transition-colors">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isLoggedIn ? (
              <>
                <DropdownMenuItem
                  className="text-xs text-muted-foreground"
                  disabled
                >
                  {displayName}
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="topbar.logout_button"
                  onClick={() => clear()}
                  className="text-destructive focus:text-destructive"
                >
                  Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                data-ocid="topbar.login_button"
                onClick={() => login()}
              >
                Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

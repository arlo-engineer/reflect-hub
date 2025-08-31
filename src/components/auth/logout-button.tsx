"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function LogoutButton({ 
  variant = "ghost", 
  size = "default",
  showIcon = true,
  showText = true,
  className = ""
}: LogoutButtonProps) {
  const { logout, isLoading } = useLogout();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={logout}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {showText && (isLoading ? "ログアウト中..." : "ログアウト")}
    </Button>
  );
}
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={() => void signOut({ callbackUrl: "/" })}
  >
    Sair
  </Button>
);

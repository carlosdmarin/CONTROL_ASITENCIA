"use client";

import { useEffect, useState } from "react";
import { fetchMe, AuthUser } from "@/lib/auth";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated"; user: null };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    let mounted = true;
    fetchMe().then((data) => {
      if (!mounted) return;
      if (data?.authenticated && data.user) {
        setState({ status: "authenticated", user: data.user });
      } else {
        setState({ status: "unauthenticated", user: null });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

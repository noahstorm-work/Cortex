"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function ConfirmedToast() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  useEffect(() => {
    if (confirmed) {
      toast.success("Email confirmed! Welcome to Cortex.", {
        icon: <CheckCircle2 className="h-4 w-4" />,
        duration: 5000,
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [confirmed]);

  return null;
}

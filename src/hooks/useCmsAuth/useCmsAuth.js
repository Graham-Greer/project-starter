"use client";

import { useContext } from "react";
import { CmsAuthContext } from "@/context/CmsAuthContext";

export function useCmsAuth() {
  const context = useContext(CmsAuthContext);
  if (!context) {
    throw new Error("useCmsAuth must be used within CmsAuthProvider");
  }
  return context;
}

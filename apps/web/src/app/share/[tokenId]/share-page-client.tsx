"use client";

import { useEffect } from "react";

export function SharePageClient() {
  useEffect(() => {
    document.body.classList.add("share-page-active");
    return () => {
      document.body.classList.remove("share-page-active");
    };
  }, []);

  return null;
}

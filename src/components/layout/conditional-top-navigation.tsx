"use client";

import { usePathname } from "next/navigation";
import { TopNavigation } from "./top-navigation";

export function ConditionalTopNavigation() {
  const pathname = usePathname();

  // Hide TopNavigation on manga-reader pages
  if (pathname.startsWith("/manga-reader/")) {
    return null;
  }
  if (pathname.startsWith("/manga-flow/")) {
    return null;
  }

  return <TopNavigation />;
}

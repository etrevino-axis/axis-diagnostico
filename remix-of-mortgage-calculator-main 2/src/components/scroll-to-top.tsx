import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset scroll position on any pathname change. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
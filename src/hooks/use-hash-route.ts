import { useEffect, useState } from "react";

/** Keeps navigation synchronized with URL hashes and browser history. */
export function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "cases");
  useEffect(() => {
    function update() {
      setRoute(window.location.hash.slice(1) || "cases");
    }
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  function reset(destination = "cases") {
    window.location.hash = destination;
    setRoute(destination);
  }
  return { route, reset };
}

import { useEffect } from "react";

export function useOutsideClick(enabled, onOutside) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const clickedNote = e.target.closest(".note-card");
      const clickedBar = e.target.closest(".bulk-bar");

      if (!clickedNote && !clickedBar) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [enabled, onOutside]);
}

import { useState } from "react";

export default function useBulkSelection(items = []) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      setSelectionMode(next.size > 0);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const selectAll = () => {
    const allIds = new Set(items.map((n) => n._id));
    setSelectedIds(allIds);
    setSelectionMode(true);
  };

  return {
    selectedIds,
    selectionMode,
    toggleSelect,
    clearSelection,
    selectAll,
  };
}

import React from "react";

function NoteModal({
    selectedNote,
    setSelectedNote,
  isClosing,
  modalTitle,
  modalContent,
  setModalTitle,
  setModalContent,
  modalLabels,
  setModalLabels,
  labelInput,
  setLabelInput,
  menuOpen,
  setMenuOpen,
  showLabelEditor,
  setShowLabelEditor,
  handleClose,
  toggleArchive,
  deleteCurrentNote,
  handleUndo,
  handleRedo,
  pushToUndo,
  highlight,
}) {
  if (!selectedNote) return null;

  return (
    <div
      onMouseDown={() => handleClose(true)}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
        isClosing ? "opacity-0 transition" : ""
      }`}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`w-[90%] max-w-2xl rounded-xl p-6 shadow-xl ${
          isClosing ? "scale-95" : "scale-100"
        } transition-all duration-200`}
        style={{ backgroundColor: selectedNote.color || "#FFFFFF" }}
      >
        {/* Title */}
        <input
          value={modalTitle}
          onChange={(e) => {
            pushToUndo();
            setModalTitle(e.target.value);
          }}
          placeholder="Title"
          className="w-full text-2xl font-semibold outline-none mb-3"
        />

        {/* Content */}
        <textarea
          value={modalContent}
          onChange={(e) => {
            pushToUndo();
            setModalContent(e.target.value);
          }}
          placeholder="Take a note..."
          className="w-full min-h-[220px] outline-none resize-none"
        />

        {/* Labels */}
        {modalLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {modalLabels.map((lbl, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-full 
                bg-emerald-50 border border-emerald-200 
                text-emerald-700 flex items-center gap-1"
              >
                {highlight(lbl)}
                <button
                  onClick={() =>
                    setModalLabels((prev) => prev.filter((l) => l !== lbl))
                  }
                  className="text-emerald-600 hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Colors + Menu */}
        <div className="flex items-center justify-between mt-3">
          {/* Colors */}
          <div className="flex gap-5 mb-2 mt-2">
            {[
              "#FFFFFF",
              "#FEF3C7",
              "#FFEDD5",
              "#DCFCE7",
              "#E0F2FE",
              "#FCE7F3",
            ].map((c) => (
              <button
                key={c}
                onClick={() =>
  setSelectedNote(prev => ({ ...prev, color: c }))
}
                className="w-5 h-5 rounded-full border hover:scale-110 transition"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Menu */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={handleUndo}
              className="px-2 py-1 text-xl rounded transition-transform duration-150 hover:scale-155"
              title="Undo"
            >
              ⟲
            </button>

            <button
              onClick={handleRedo}
              className="px-2 py-1 text-xl rounded transition-transform duration-150 hover:scale-155"
              title="Redo"
            >
              ⟳
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="px-3 py-1 border rounded"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="absolute bottom-12 right-0 bg-white border rounded shadow px-3 py-2 w-28">
                <button
                  onClick={() => {
                    setShowLabelEditor(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left mb-1"
                >
                  Edit Labels
                </button>

                <button
                  onClick={toggleArchive}
                  className="block w-full text-left mb-1"
                >
                  {selectedNote.isArchived ? "Unarchive" : "Archive"}
                </button>

                <button
                  onClick={deleteCurrentNote}
                  className="block w-full text-left text-red-600"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Label Editor */}
            {showLabelEditor && (
              <div
                className="absolute bottom-16 right-0 bg-white/80 backdrop-blur-md
                border border-emerald-200 rounded-xl shadow-lg p-3 w-64"
              >
                <p className="text-sm font-medium text-emerald-700 mb-2">
                  Edit Labels
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {modalLabels.map((lbl, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full
                      bg-emerald-50/80 border border-emerald-200
                      text-emerald-700 flex items-center gap-1"
                    >
                      {lbl}
                      <button
                        onClick={() =>
                          setModalLabels((prev) =>
                            prev.filter((l) => l !== lbl)
                          )
                        }
                        className="text-emerald-600 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = labelInput.trim();
                        if (v && !modalLabels.includes(v)) {
                          setModalLabels((prev) => [...prev, v]);
                        }
                        setLabelInput("");
                        setShowLabelEditor(false);
                      }
                    }}
                    placeholder="Add label"
                    className="flex-1 px-2 py-1 text-xs rounded-lg
                    border border-emerald-300 bg-white/70"
                  />

                  <button
                    onClick={() => {
                      const v = labelInput.trim();
                      if (v && !modalLabels.includes(v)) {
                        setModalLabels((prev) => [...prev, v]);
                      }
                      setLabelInput("");
                      setShowLabelEditor(false);
                    }}
                    className="px-2 py-1 text-xs rounded-lg
                    bg-emerald-600/80 text-white hover:bg-emerald-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteModal;

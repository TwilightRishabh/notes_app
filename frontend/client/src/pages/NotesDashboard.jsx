// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function NotesDashboard() {
//   const [notes, setNotes] = useState([]);
//   const [search, setSearch] = useState("");

  

//   const [selectedNote, setSelectedNote] = useState(null);
//   const [modalTitle, setModalTitle] = useState("");
//   const [modalContent, setModalContent] = useState("");

//   const navigate = useNavigate();

//   /* Lock background scroll */
//   useEffect(() => {
//     document.body.style.overflow = selectedNote ? "hidden" : "auto";
//     return () => (document.body.style.overflow = "auto");
//   }, [selectedNote]);

//   /* Fetch notes */
//   const fetchNotes = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return navigate("/login");

//       const res = await axios.get("http://localhost:5000/api/notes", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setNotes(res.data);
//     } catch {
//       navigate("/login");
//     }
//   };

//   useEffect(() => {
//     fetchNotes();
//   }, []);

//   /* Search filter */
//   const filteredNotes = useMemo(() => {
//   const q = search.toLowerCase();

//   const filtered = notes.filter(
//     (n) =>
//       n.title?.toLowerCase().includes(q) ||
//       n.content?.toLowerCase().includes(q)
//   );

//   return filtered.sort((a, b) => b.isPinned - a.isPinned);
//   }, [notes, search]);


//   /* Highlight */
//   const highlightText = (text, query) => {
//     if (!query) return text;
//     const regex = new RegExp(`(${query})`, "gi");

//     return text.split(regex).map((part, i) =>
//       part.toLowerCase() === query.toLowerCase() ? (
//         <span
//           key={i}
//           className="bg-emerald-200 text-emerald-900 px-1 rounded"
//         >
//           {part}
//         </span>
//       ) : (
//         part
//       )
//     );
//   };

//   /* Open note */
//   const openNote = (note) => {
//     setSelectedNote(note);
//     setModalTitle(note.title || "");
//     setModalContent(note.content || "");
//   };

//   /* Close modal */
//   const closeModal = async () => {
//     if (!selectedNote) return;

//     const title = modalTitle.trim();
//     const content = modalContent.trim();
//     const token = localStorage.getItem("token");

//     try {
//       if (!title && !content && selectedNote._id) {
//         await axios.delete(
//           `http://localhost:5000/api/notes/${selectedNote._id}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         setNotes((prev) =>
//           prev.filter((n) => n._id !== selectedNote._id)
//         );
//       } else {
//         let res;
//         if (selectedNote._id) {
//           res = await axios.put(
//             `http://localhost:5000/api/notes/${selectedNote._id}`,
//             { title, content },
//             { headers: { Authorization: `Bearer ${token}` } }
//           );

//           setNotes((prev) =>
//             prev.map((n) =>
//               n._id === res.data._id ? res.data : n
//             )
//           );
//         } else {
//           res = await axios.post(
//             "http://localhost:5000/api/notes",
//             { title, content },
//             { headers: { Authorization: `Bearer ${token}` } }
//           );

//           setNotes((prev) => [res.data, ...prev]);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }

//     setSelectedNote(null);
//   };

//   return (
//     <div className="min-h-screen bg-emerald-50 px-6 py-8">
//       <div className="max-w-6xl mx-auto">

//         {/* Search */}
//         <input
//           type="text"
//           placeholder="Search notes..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="
//             w-full mb-8 px-4 py-3 rounded-lg
//             bg-white border border-emerald-200
//             focus:outline-none focus:ring-2 focus:ring-emerald-300
//           "
//         />

//         {/* Notes */}
//         {filteredNotes.length === 0 ? (
//           <div className="flex items-center justify-center h-[60vh] text-emerald-700">
//             {search ? "No matching notes" : "No notes yet"}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {filteredNotes.map((note) => (
//               <div
//                 key={note._id}
//                 onClick={() => openNote(note)}
//                 className="
//                   bg-white rounded-xl p-5
//                   border border-emerald-100
//                   hover:border-emerald-300
//                   hover:-translate-y-1
//                   transition-all cursor-pointer
//                 "
//               >
//                 <h3 className="font-semibold text-gray-800 mb-2 truncate">
//                   {highlightText(note.title || "Untitled", search)}
//                 </h3>
//                 <p className="text-sm text-gray-600 line-clamp-4">
//                   {highlightText(note.content || "", search)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Floating button */}
//       <button
//         onClick={() => {
//           setSelectedNote({ _id: null });
//           setModalTitle("");
//           setModalContent("");
//         }}
//         className="
//           fixed bottom-6 right-6
//           w-14 h-14 rounded-full
//           bg-emerald-600 text-white
//           flex items-center justify-center
//           shadow-lg hover:bg-emerald-700
//           active:scale-95 transition
//         "
//       >
//         +
//       </button>

//       {/* Modal */}
//       {selectedNote && (
//         <div
//           className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//           onMouseDown={closeModal}
//         >
//           <div
//             onMouseDown={(e) => e.stopPropagation()}
//             className="bg-white w-[90%] max-w-2xl rounded-xl p-6"
//           >
//             <input
//               className="w-full text-2xl font-semibold mb-4 outline-none"
//               value={modalTitle}
//               onChange={(e) => setModalTitle(e.target.value)}
//               placeholder="Title"
//             />

//             <textarea
//               className="w-full min-h-[200px] outline-none resize-none"
//               value={modalContent}
//               onChange={(e) => setModalContent(e.target.value)}
//               placeholder="Take a note..."
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default NotesDashboard;




import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "auto";
  }, [selectedNote]);

  /* Fetch notes */
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(res.data);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* Filter + sort pinned first */
  const filteredNotes = useMemo(() => {
  const q = search.trim().toLowerCase();

  const list = q
    ? notes.filter(
        n =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
      )
    : notes;

  // IMPORTANT — create a copy before sorting
  return [...list].sort(
    (a, b) => Number(b.isPinned) - Number(a.isPinned)
  );
}, [notes, search]);

  /* Highlight search */
  const highlight = (text, q) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q})`, "gi");

    return text.split(regex).map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  /* ---------- PIN / UNPIN ---------- */
 const togglePin = async (note) => {
  const token = localStorage.getItem("token");

  const res = await axios.put(
    `http://localhost:5000/api/notes/${note._id}`,
    {
      title: note.title,
      content: note.content,
      isPinned: !note.isPinned,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setNotes(prev =>
    prev.map(n => (n._id === res.data._id ? res.data : n))
  );

  if (selectedNote && selectedNote._id === res.data._id) {
    setSelectedNote(res.data);
  }
};



  /* ---------- OPEN NOTE ---------- */
  const openNote = (note) => {
    setSelectedNote(note);
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
    setMenuOpen(false);
  };

  /* ---------- SAVE / DELETE / CLOSE ---------- */
  const closeModal = async () => {
    if (!selectedNote) return;

    const title = modalTitle.trim();
    const content = modalContent.trim();
    const token = localStorage.getItem("token");

    // CASE 1 — New note + empty → close without saving
    if (!selectedNote._id && !title && !content) {
      return setSelectedNote(null);
    }

    // CASE 2 — Existing note + both empty → delete
    if (selectedNote._id && !title && !content) {
      await axios.delete(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) => prev.filter((n) => n._id !== selectedNote._id));
      return setSelectedNote(null);
    }

    // CASE 3 — Update existing
    if (selectedNote._id) {
      const res = await axios.put(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) =>
        prev.map((n) => (n._id === res.data._id ? res.data : n))
      );
    }

    // CASE 4 — Create new note
    if (!selectedNote._id) {
      const res = await axios.post(
        "http://localhost:5000/api/notes",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) => [res.data, ...prev]);
    }

    setSelectedNote(null);
  };

  /* ---------- DELETE from menu ---------- */
  const deleteNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((prev) => prev.filter((n) => n._id !== selectedNote._id));
    setSelectedNote(null);
  };

  /* ---------- PIN ICON ---------- */
  const PinIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill={active ? "#059669" : "none"}
      stroke="#059669"
      strokeWidth="1.6"
      d="M12 2l4 4-2 2 3 7-2 2-7-3-2 2-4-4 2-2-3-7 2-2 7 3z"
    />
  </svg>
);


  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
        />

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              onClick={() => openNote(note)}
              className="relative bg-white rounded-xl p-5 border border-emerald-100 hover:border-emerald-300 transition cursor-pointer"
            >
              {/* Pin in preview */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(note);
                }}
                className="absolute top-3 right-3"
              >
                <PinIcon active={note.isPinned} />
              </button>

              <h3 className="font-semibold mb-2 truncate text-gray-800">
                {highlight(note.title || "Untitled", search)}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-4">
                {highlight(note.content || "", search)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* + Button */}
      <button
        onClick={() => openNote({ _id: null })}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700"
      >
        +
      </button>

      {/* Modal */}
      {selectedNote && (
        <div
          onMouseDown={closeModal}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white w-[90%] max-w-2xl rounded-xl p-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <input
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-2xl font-semibold outline-none"
              />

              {selectedNote._id && (
                <button onClick={() => togglePin(selectedNote)}>
                  <PinIcon active={selectedNote.isPinned} />
                </button>
              )}
            </div>

            <textarea
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
              placeholder="Take a note..."
              className="w-full min-h-[220px] outline-none resize-none"
            />

            {/* Bottom Action Bar */}
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="px-3 py-1 border rounded"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="bg-white border rounded shadow px-3 py-2">
                  <button onClick={deleteNote} className="text-red-600">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesDashboard;

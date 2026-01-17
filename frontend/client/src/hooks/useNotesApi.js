import axios from "axios";

const API = "https://jotter-backend-l0ki.onrender.com/api/notes";


export function useNotesApi() {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const getNotes = () => axios.get(API, { headers });
const getTrashedNotes = () => axios.get(`${API}?onlyDeleted=true`, { headers });

  const createNote = (data) => axios.post(API, data, { headers });
  const updateNote = (id, data) => axios.put(`${API}/${id}`, data, { headers });
  const deleteNote = (id) => axios.delete(`${API}/${id}`, { headers });

  return {
    getNotes,
    getTrashedNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}

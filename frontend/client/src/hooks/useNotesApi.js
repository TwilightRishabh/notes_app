import axios from "axios";

const API = "http://localhost:5000/api/notes";

export function useNotesApi() {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const getNotes = () => axios.get(API, { headers });
  const createNote = (data) => axios.post(API, data, { headers });
  const updateNote = (id, data) => axios.put(`${API}/${id}`, data, { headers });
  const deleteNote = (id) => axios.delete(`${API}/${id}`, { headers });

  return {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}

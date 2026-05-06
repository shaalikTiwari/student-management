import { useState, useEffect } from "react";
import axios from "axios";

const API = "/api";

function Section({ title, children }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function App() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [tForm, setTForm] = useState({ name: "", subject: "" });
  const [cForm, setCForm] = useState({ title: "", code: "" });
  const [sForm, setSForm] = useState({ name: "", email: "", teacher: "", courses: [] });

  const [editingT, setEditingT] = useState(null);
  const [editingC, setEditingC] = useState(null);
  const [editingS, setEditingS] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setTeachers((await axios.get(`${API}/teachers`)).data);
    setCourses((await axios.get(`${API}/courses`)).data);
    setStudents((await axios.get(`${API}/students`)).data);
  }

  async function saveTeacher() {
    if (editingT) { await axios.put(`${API}/teachers/${editingT}`, tForm); setEditingT(null); }
    else await axios.post(`${API}/teachers`, tForm);
    setTForm({ name: "", subject: "" }); fetchAll();
  }
  async function deleteTeacher(id) { await axios.delete(`${API}/teachers/${id}`); fetchAll(); }

  async function saveCourse() {
    if (editingC) { await axios.put(`${API}/courses/${editingC}`, cForm); setEditingC(null); }
    else await axios.post(`${API}/courses`, cForm);
    setCForm({ title: "", code: "" }); fetchAll();
  }
  async function deleteCourse(id) { await axios.delete(`${API}/courses/${id}`); fetchAll(); }

  async function saveStudent() {
    if (editingS) { await axios.put(`${API}/students/${editingS}`, sForm); setEditingS(null); }
    else await axios.post(`${API}/students`, sForm);
    setSForm({ name: "", email: "", teacher: "", courses: [] }); fetchAll();
  }
  async function deleteStudent(id) { await axios.delete(`${API}/students/${id}`); fetchAll(); }

  const inp = { padding: "6px 10px", marginRight: 8, borderRadius: 4, border: "1px solid #aaa" };
  const btn = (color) => ({ padding: "6px 14px", background: color, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", marginRight: 4 });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>🎓 Student Management System</h1>

      <Section title="👨‍🏫 Teachers (One-to-Many: 1 Teacher → Many Students)">
        <input style={inp} placeholder="Name" value={tForm.name} onChange={e => setTForm({ ...tForm, name: e.target.value })} />
        <input style={inp} placeholder="Subject" value={tForm.subject} onChange={e => setTForm({ ...tForm, subject: e.target.value })} />
        <button style={btn("#2196F3")} onClick={saveTeacher}>{editingT ? "Update" : "Add"} Teacher</button>
        {editingT && <button style={btn("#999")} onClick={() => { setEditingT(null); setTForm({ name: "", subject: "" }); }}>Cancel</button>}
        <table width="100%" style={{ marginTop: 12, borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f0f0f0" }}><th>Name</th><th>Subject</th><th>Actions</th></tr></thead>
          <tbody>{teachers.map(t => (
            <tr key={t._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 6 }}>{t.name}</td><td style={{ padding: 6 }}>{t.subject}</td>
              <td style={{ padding: 6 }}>
                <button style={btn("#FF9800")} onClick={() => { setEditingT(t._id); setTForm({ name: t.name, subject: t.subject }); }}>Edit</button>
                <button style={btn("#f44336")} onClick={() => deleteTeacher(t._id)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </Section>

      <Section title="📚 Courses (Many-to-Many: Courses ↔ Students)">
        <input style={inp} placeholder="Title" value={cForm.title} onChange={e => setCForm({ ...cForm, title: e.target.value })} />
        <input style={inp} placeholder="Code (e.g. CS101)" value={cForm.code} onChange={e => setCForm({ ...cForm, code: e.target.value })} />
        <button style={btn("#9C27B0")} onClick={saveCourse}>{editingC ? "Update" : "Add"} Course</button>
        {editingC && <button style={btn("#999")} onClick={() => { setEditingC(null); setCForm({ title: "", code: "" }); }}>Cancel</button>}
        <table width="100%" style={{ marginTop: 12, borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f0f0f0" }}><th>Title</th><th>Code</th><th>Actions</th></tr></thead>
          <tbody>{courses.map(c => (
            <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 6 }}>{c.title}</td><td style={{ padding: 6 }}>{c.code}</td>
              <td style={{ padding: 6 }}>
                <button style={btn("#FF9800")} onClick={() => { setEditingC(c._id); setCForm({ title: c.title, code: c.code }); }}>Edit</button>
                <button style={btn("#f44336")} onClick={() => deleteCourse(c._id)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </Section>

      <Section title="🧑‍🎓 Students (linked to Teacher + Courses)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <input style={inp} placeholder="Name" value={sForm.name} onChange={e => setSForm({ ...sForm, name: e.target.value })} />
          <input style={inp} placeholder="Email" value={sForm.email} onChange={e => setSForm({ ...sForm, email: e.target.value })} />
          <select style={inp} value={sForm.teacher} onChange={e => setSForm({ ...sForm, teacher: e.target.value })}>
            <option value="">-- Select Teacher --</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <div>
            <label style={{ fontSize: 13, color: "#555" }}>Courses (hold Cmd to multi-select):</label><br />
            <select multiple style={{ ...inp, height: 80 }}
              value={sForm.courses}
              onChange={e => setSForm({ ...sForm, courses: [...e.target.selectedOptions].map(o => o.value) })}>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
        </div>
        <button style={btn("#4CAF50")} onClick={saveStudent}>{editingS ? "Update" : "Add"} Student</button>
        {editingS && <button style={btn("#999")} onClick={() => { setEditingS(null); setSForm({ name: "", email: "", teacher: "", courses: [] }); }}>Cancel</button>}
        <table width="100%" style={{ marginTop: 12, borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f0f0f0" }}><th>Name</th><th>Email</th><th>Teacher (1:M)</th><th>Courses (M:M)</th><th>Actions</th></tr></thead>
          <tbody>{students.map(s => (
            <tr key={s._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 6 }}>{s.name}</td>
              <td style={{ padding: 6 }}>{s.email}</td>
              <td style={{ padding: 6 }}>{s.teacher?.name || "—"}</td>
              <td style={{ padding: 6 }}>{s.courses?.map(c => c.title).join(", ") || "—"}</td>
              <td style={{ padding: 6 }}>
                <button style={btn("#FF9800")} onClick={() => {
                  setEditingS(s._id);
                  setSForm({ name: s.name, email: s.email, teacher: s.teacher?._id || "", courses: s.courses?.map(c => c._id) || [] });
                }}>Edit</button>
                <button style={btn("#f44336")} onClick={() => deleteStudent(s._id)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </Section>
    </div>
  );
}
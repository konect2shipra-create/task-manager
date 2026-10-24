import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api(`/auth/${mode}`, "POST", form);
      setToken(data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth">
      <h1>Task Manager</h1>
      <p className="muted">Plan your day and tick things off.</p>
      <form onSubmit={submit}>
        {mode === "register" && <input name="name" placeholder="Name" value={form.name} onChange={change} required />}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
        <input name="password" type="password" placeholder="Password (6+ characters)" value={form.password} onChange={change} required />
        {error && <p className="error">{error}</p>}
        <button className="primary">{mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      <button className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
      </button>
    </main>
  );
}

const empty = { title: "", priority: "medium", dueDate: "" };

function Tasks({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = () => api("/tasks").then(setTasks).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) await api(`/tasks/${editId}`, "PUT", form);
      else await api("/tasks", "POST", form);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (t) => { await api(`/tasks/${t._id}`, "PUT", { completed: !t.completed }); load(); };
  const remove = async (id) => { await api(`/tasks/${id}`, "DELETE"); load(); };
  const edit = (t) => {
    setEditId(t._id);
    setForm({ title: t.title, priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "" });
  };

  const shown = tasks
    .filter((t) => filter === "all" || (filter === "done" ? t.completed : !t.completed))
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const isOverdue = (t) => t.dueDate && !t.completed && new Date(t.dueDate) < new Date(new Date().toDateString());

  return (
    <main className="app">
      <header>
        <h1>Hi, {user.name}</h1>
        <button className="link" onClick={onLogout}>Log out</button>
      </header>

      <form className="add" onSubmit={save}>
        <input placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <button className="primary">{editId ? "Save changes" : "Add task"}</button>
        {editId && <button type="button" className="link" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <input placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
        {["all", "pending", "done"].map((f) => (
          <button key={f} className={filter === f ? "chip on" : "chip"} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <ul className="list">
        {shown.map((t) => (
          <li key={t._id} className={t.completed ? "done" : ""}>
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} aria-label="Mark complete" />
            <div className="body">
              <span className="title">{t.title}</span>
              <span className="meta">
                <span className={`tag ${t.priority}`}>{t.priority}</span>
                {t.dueDate && <span className={isOverdue(t) ? "overdue" : ""}>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
              </span>
            </div>
            <button className="link" onClick={() => edit(t)}>Edit</button>
            <button className="link danger" onClick={() => remove(t._id)}>Delete</button>
          </li>
        ))}
        {!shown.length && <p className="muted">No tasks here yet. Add one above.</p>}
      </ul>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => (getToken() ? JSON.parse(localStorage.getItem("tm_user") || "null") : null));
  const onAuth = (u) => { localStorage.setItem("tm_user", JSON.stringify(u)); setUser(u); };
  const logout = () => { setToken(null); localStorage.removeItem("tm_user"); setUser(null); };
  return user ? <Tasks user={user} onLogout={logout} /> : <Auth onAuth={onAuth} />;
}

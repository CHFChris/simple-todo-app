// DOM-Elemente auswählen
const todoInput = document.getElementById("todoInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");

const counterEl = document.getElementById("counter");
const filterSelect = document.getElementById("filterSelect");

// State
let todos = [];
let filter = "all"; // 'all', 'active', 'completed'
let editingId = null;

// Helpers
const isValidPriority = (p) => p === "low" || p === "medium" || p === "high";

const formatDueDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}.${m}.${y}`;
};

const todayMidnight = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const isOverdue = (todo) => {
  if (todo.completed) return false;
  if (!todo.dueDate) return false;
  const due = new Date(`${todo.dueDate}T00:00:00`);
  return due < todayMidnight();
};

const saveTodos = () => {
  localStorage.setItem("todos", JSON.stringify(todos));
};

const normalizeTodo = (t) => ({
  id: Number(t.id),
  text: String(t.text ?? ""),
  completed: Boolean(t.completed),
  priority: isValidPriority(t.priority) ? t.priority : "medium",
  dueDate: typeof t.dueDate === "string" ? t.dueDate : "",
});

const loadTodos = () => {
  const stored = localStorage.getItem("todos");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        todos = parsed.map(normalizeTodo);
      }
    } catch (e) {
      console.warn("Konnte Todos nicht laden:", e);
      todos = [];
    }
  }
  renderTodos();
};

// CRUD
const addTodo = () => {
  const text = todoInput.value.trim();
  const priority = prioritySelect ? prioritySelect.value : "medium";
  const dueDate = dueDateInput ? dueDateInput.value : "";

  if (text === "") {
    alert("Bitte eine Aufgabe eingeben!");
    return;
  }

  const todo = {
    id: Date.now(),
    text,
    completed: false,
    priority: isValidPriority(priority) ? priority : "medium",
    dueDate: typeof dueDate === "string" ? dueDate : "",
  };

  todos.push(todo);

  todoInput.value = "";
  if (prioritySelect) prioritySelect.value = "medium";
  if (dueDateInput) dueDateInput.value = "";

  saveTodos();
  renderTodos();
};

const toggleTodo = (id) => {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
};

const deleteTodo = (id) => {
  if (editingId === id) editingId = null;
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
};

// Edit
const startEdit = (id) => {
  editingId = id;
  renderTodos();
};

const cancelEdit = () => {
  editingId = null;
  renderTodos();
};

const saveEdit = (id, newText, newPriority, newDueDate) => {
  const text = String(newText ?? "").trim();
  if (text === "") {
    alert("Bitte eine Aufgabe eingeben!");
    return;
  }

  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.text = text;
  todo.priority = isValidPriority(newPriority) ? newPriority : "medium";
  todo.dueDate = typeof newDueDate === "string" ? newDueDate : "";

  editingId = null;
  saveTodos();
  renderTodos();
};

// Optional: Filter / Counter
const getFilteredTodos = () => {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "completed") return todos.filter((t) => t.completed);
  return todos;
};

const updateCounter = () => {
  if (!counterEl) return;
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  counterEl.textContent = `${done} von ${total} erledigt`;
};

// Rendering
const renderTodo = (todo) => {
  const li = document.createElement("li");
  li.className = "todo-item";

  if (todo.completed) li.classList.add("completed");
  if (isOverdue(todo)) li.classList.add("overdue");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const main = document.createElement("div");
  main.className = "todo-main";

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  // Edit-Mode
  if (todo.id === editingId) {
    const editRow = document.createElement("div");
    editRow.className = "edit-row";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = todo.text;

    const prioSelect = document.createElement("select");
    prioSelect.innerHTML = `
      <option value="low">Niedrig</option>
      <option value="medium">Mittel</option>
      <option value="high">Hoch</option>
    `;
    prioSelect.value = todo.priority;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = todo.dueDate || "";

    editRow.appendChild(textInput);
    editRow.appendChild(prioSelect);
    editRow.appendChild(dateInput);
    main.appendChild(editRow);

    const saveBtn = document.createElement("button");
    saveBtn.className = "save-btn";
    saveBtn.textContent = "Speichern";
    saveBtn.addEventListener("click", () =>
      saveEdit(todo.id, textInput.value, prioSelect.value, dateInput.value)
    );

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "cancel-btn";
    cancelBtn.textContent = "Abbrechen";
    cancelBtn.addEventListener("click", cancelEdit);

    textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveEdit(todo.id, textInput.value, prioSelect.value, dateInput.value);
      }
      if (e.key === "Escape") {
        cancelEdit();
      }
    });

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    li.appendChild(checkbox);
    li.appendChild(main);
    li.appendChild(actions);
    todoList.appendChild(li);

    textInput.focus();
    textInput.setSelectionRange(textInput.value.length, textInput.value.length);
    return;
  }

  // Normal-Mode
  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const meta = document.createElement("div");
  meta.className = "todo-meta";

  const badge = document.createElement("span");
  badge.className = `priority-badge priority-${todo.priority}`;
  badge.textContent =
    todo.priority === "low" ? "niedrig" : todo.priority === "high" ? "hoch" : "mittel";

  meta.appendChild(badge);

  if (todo.dueDate) {
    const due = document.createElement("span");
    due.className = "due-date";
    due.textContent = `fällig: ${formatDueDate(todo.dueDate)}`;
    meta.appendChild(due);
  }

  main.appendChild(text);
  main.appendChild(meta);

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Bearbeiten";
  editBtn.addEventListener("click", () => startEdit(todo.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "X";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(main);
  li.appendChild(actions);
  todoList.appendChild(li);
};

const renderTodos = () => {
  todoList.innerHTML = "";

  const list = getFilteredTodos();
  list.forEach((todo) => renderTodo(todo));

  updateCounter();
};

// Events
addBtn.addEventListener("click", () => addTodo());

todoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTodo();
});

if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    filter = filterSelect.value;
    renderTodos();
  });
}

// Start
loadTodos();
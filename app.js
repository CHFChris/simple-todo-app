// DOM-Elemente auswählen
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// Optional (Teil 6): Counter/Filter nur, wenn du die Elemente ins HTML einbaust
const counterEl = document.getElementById('counter');
const filterSelect = document.getElementById('filterSelect');

// Daten-Array für unsere Todos
let todos = [];
let filter = 'all'; // 'all', 'active', 'completed'

// LocalStorage: speichern/laden
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
  const stored = localStorage.getItem('todos');
  if (stored) {
    todos = JSON.parse(stored);
  }
  renderTodos();
}

// Todo hinzufügen
function addTodo() {
  const text = todoInput.value.trim();

  if (text === '') {
    alert('Bitte eine Aufgabe eingeben!');
    return;
  }

  const todo = {
    id: Date.now(),
    text: text,
    completed: false
  };

  console.log('DEBUG: Neues Todo hinzugefügt:', todo);

  // WICHTIG: fehlende Zeile aus dem Tutorial
  todos.push(todo);

  console.log('DEBUG: Alle Todos:', todos);

  todoInput.value = '';
  saveTodos();
  renderTodos();
}

// Todo togglen
function toggleTodo(id) {
  const todo = todos.find(function (t) {
    return t.id === id;
  });

  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

// Todo löschen
function deleteTodo(id) {
  todos = todos.filter(function (t) {
    return t.id !== id;
  });

  saveTodos();
  renderTodos();
}

// Einzelnes Todo rendern
function renderTodo(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item';

  if (todo.completed) {
    li.classList.add('completed');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', function () {
    toggleTodo(todo.id);
  });

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'X';
  deleteBtn.addEventListener('click', function () {
    deleteTodo(todo.id);
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  todoList.appendChild(li);
}

// Optional (Teil 6): Filter
function getFilteredTodos() {
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

// Optional (Teil 6): Counter
function updateCounter() {
  if (!counterEl) return;
  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  counterEl.textContent = `${done} von ${total} erledigt`;
}

// Alle Todos rendern
function renderTodos() {
  todoList.innerHTML = '';

  // WICHTIG: fehlende Logik aus dem Tutorial
  const list = getFilteredTodos();
  list.forEach(function (todo) {
    renderTodo(todo);
  });

  updateCounter();
}

// Event Listener
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    addTodo();
  }
});

if (filterSelect) {
  filterSelect.addEventListener('change', function () {
    filter = filterSelect.value;
    renderTodos();
  });
}

// Beim Start laden
loadTodos();

// Estado de la aplicación
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Elementos del DOM
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const currentDateElement = document.getElementById('currentDate');
const emptyState = document.getElementById('emptyState');

// Actualizar fecha actual
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('es-ES', options);
}

// Funciones principales
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
        // Efecto visual de error
        todoInput.style.borderColor = 'var(--danger)';
        todoInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
        
        setTimeout(() => {
            todoInput.style.borderColor = 'var(--gray-light)';
            todoInput.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
        }, 1000);
        
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
    
    // Efecto visual de éxito
    todoInput.focus();
}

function deleteTodo(id) {
    // Encontrar el elemento para animarlo
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.style.animation = 'slideOut 0.3s ease forwards';
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }, 300);
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function clearCompleted() {
    const completedTodos = todos.filter(todo => todo.completed);
    if (completedTodos.length === 0) {
        alert('No hay tareas completadas para eliminar');
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar ${completedTodos.length} tarea(s) completada(s)?`)) {
        // Animación para eliminar todas las tareas completadas
        const completedItems = document.querySelectorAll('.todo-item.completed');
        completedItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    todos = todos.filter(todo => !todo.completed);
                    saveTodos();
                    if (index === completedItems.length - 1) {
                        renderTodos();
                    }
                }, 300);
            }, index * 100);
        });
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    // Filtrar todos según el filtro actual
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }
    
    // Limpiar lista
    todoList.innerHTML = '';
    
    // Renderizar cada todo
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        
        // Formatear fecha
        const date = new Date(todo.createdAt);
        const formattedDate = date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short' 
        });
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-date">Agregada: ${formattedDate}</span>
            </div>
            <button class="delete-btn">
                <i class="fas fa-trash-alt"></i>
                <span>Eliminar</span>
            </button>
        `;
        
        // Event listeners
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        const todoText = li.querySelector('.todo-text');
        todoText.addEventListener('click', () => toggleTodo(todo.id));
        
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(li);
    });
    
    updateCounts();
    updateEmptyState();
}

function updateCounts() {
    const totalCount = todos.length;
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    
    document.getElementById('allCount').textContent = totalCount;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('itemsLeft').textContent = `${activeCount} ${activeCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
}

function updateEmptyState() {
    const filteredTodos = todoList.children.length;
    emptyState.style.display = filteredTodos === 0 ? 'flex' : 'none';
}

// Event listeners
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Animación para el input al cargar
window.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    renderTodos();
    
    // Efecto de enfoque en el input
    setTimeout(() => {
        todoInput.focus();
    }, 500);
    
    // Añadir algunos consejos en el placeholder
    const placeholders = [
        "¿Qué necesitas hacer hoy?",
        "Escribe tu primera tarea...",
        "Planifica tu día aquí",
        "¿Qué tienes pendiente?"
    ];
    
    let currentPlaceholder = 0;
    setInterval(() => {
        todoInput.placeholder = placeholders[currentPlaceholder];
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
    }, 3000);
});

// Animación para nuevos elementos
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar observador a los nuevos elementos
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.todo-item').forEach(item => {
        observer.observe(item);
    });
});
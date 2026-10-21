'use strict';

/**
 * TaskFlow
 * Task management application.
 *
 * Features:
 * - Create, edit, delete and complete tasks
 * - Work, Personal and Shopping categories
 * - Search tasks by description
 * - Filter tasks by completion status
 * - Filter tasks by category
 * - Persist tasks and categories in Local Storage
 * - Support legacy tasks without categories
 */

class TaskFlow {
    constructor() {
        // Preserve the startup error handling from the main branch.
        try {
            this.storageKey = 'taskflow_tasks';
            this.counterKey = 'taskflow_counter';

            this.categories = ['Work', 'Personal', 'Shopping'];

            // Category, search and status filters.
            this.activeCategory = 'All';
            this.searchQuery = '';
            this.currentFilter = 'all';

            this.tasks = this.loadTasks();
            this.taskIdCounter = this.getNextTaskId();

            this.initializeApp();
            this.bindEvents();
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            console.error('TaskFlow failed to start:', error);

            this.showNotification(
                'TaskFlow failed to start. Please reload the page.',
                'error'
            );

            throw error;
        }
    }

    // ========================================
    // Initialization
    // ========================================

    initializeApp() {
        console.log('TaskFlow initialized successfully.');
    }

    /**
     * Returns a required HTML element by ID.
     */
    getElement(id) {
        const element = document.getElementById(id);

        if (!element) {
            throw new Error(`Required HTML element not found: ${id}`);
        }

        return element;
    }

    /**
     * Connects the application to HTML events.
     */
    bindEvents() {
        const addTaskBtn = this.getElement('addTaskBtn');
        const taskInput = this.getElement('taskInput');
        const categoryInput = this.getElement('taskCategory');
        const categoryFilter = this.getElement('categoryFilter');
        const searchInput = this.getElement('searchInput');

        addTaskBtn.addEventListener('click', () => {
            this.addTask();
        });

        taskInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.addTask();
            }
        });

        taskInput.addEventListener('input', () => {
            taskInput.setCustomValidity('');
        });

        categoryInput.addEventListener('change', () => {
            if (!this.categories.includes(categoryInput.value)) {
                categoryInput.setCustomValidity('Please select a valid category.');
            } else {
                categoryInput.setCustomValidity('');
            }
        });

        // Category filtering.
        categoryFilter.addEventListener('change', (event) => {
            this.activeCategory = event.target.value;
            this.renderTasks();
        });

        // Search filtering.
        searchInput.addEventListener('input', (event) => {
            this.searchQuery = event.target.value;
            this.renderTasks();
        });

        // Status filtering.
        document.querySelectorAll('.filter-btn').forEach((button) => {
            button.addEventListener('click', () => {
                this.setFilter(button.dataset.filter);
            });
        });

        // Focus on the task input when the page loads.
        taskInput.focus();
    }

    /**
     * Changes the active completion-status filter.
     */
    setFilter(filter) {
        const validFilters = ['all', 'pending', 'completed'];

        if (!validFilters.includes(filter)) {
            return;
        }

        this.currentFilter = filter;

        document.querySelectorAll('.filter-btn').forEach((button) => {
            const isActive = button.dataset.filter === filter;

            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        this.renderTasks();
    }

    // ========================================
    // Create Tasks
    // ========================================

    /**
     * Creates a task using the description and selected category.
     */
    addTask() {
        const taskInput = this.getElement('taskInput');
        const categoryInput = this.getElement('taskCategory');

        const taskText = taskInput.value.trim();
        const category = categoryInput.value;
        const MAX_TASK_LENGTH = 500;

        if (!taskText) {
            this.showNotification(
                'Please enter a task description.',
                'warning'
            );

            taskInput.focus();
            return;
        }

        if (taskText.length > MAX_TASK_LENGTH) {
            this.showNotification(
                `Task descriptions cannot exceed ${MAX_TASK_LENGTH} characters.`,
                'warning'
            );

            taskInput.focus();
            return;
        }

        if (!this.categories.includes(category)) {
            this.showNotification(
                'Please select a valid category.',
                'warning'
            );

            categoryInput.focus();
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(newTask);

        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        taskInput.value = '';
        taskInput.focus();

        this.showNotification(
            'Task added successfully!',
            'success'
        );
    }

    // ========================================
    // Delete Tasks
    // ========================================

    /**
     * Deletes a task by ID.
     */
    deleteTask(id) {
        const task = this.tasks.find((item) => item.id === id);

        if (!task) {
            this.showNotification('Task not found.', 'error');
            return;
        }

        this.tasks = this.tasks.filter((item) => item.id !== id);

        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.showNotification(
            'Task deleted successfully!',
            'success'
        );
    }

    // ========================================
    // Complete Tasks
    // ========================================

    /**
     * Toggles a task's completion status.
     */
    toggleTask(id) {
        const task = this.tasks.find((item) => item.id === id);

        if (!task) {
            this.showNotification('Task not found.', 'error');
            return;
        }

        task.completed = !task.completed;

        task.completedAt = task.completed
            ? new Date().toISOString()
            : null;

        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    // ========================================
    // Edit Tasks
    // ========================================

    /**
     * Allows the user to edit a task's description.
     */
    editTask(id) {
        const task = this.tasks.find((item) => item.id === id);

        if (!task) {
            this.showNotification('Task not found.', 'error');
            return;
        }

        const newText = prompt('Edit your task:', task.text);

        if (newText === null) {
            return;
        }

        const updatedText = newText.trim();
        const MAX_TASK_LENGTH = 500;

        if (!updatedText) {
            this.showNotification(
                'Task description cannot be empty.',
                'warning'
            );
            return;
        }

        if (updatedText.length > MAX_TASK_LENGTH) {
            this.showNotification(
                `Task descriptions cannot exceed ${MAX_TASK_LENGTH} characters.`,
                'warning'
            );
            return;
        }

        task.text = updatedText;

        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.showNotification(
            'Task updated successfully!',
            'success'
        );
    }

    // ========================================
    // Category Management
    // ========================================

    /**
     * Returns a task's category.
     * Legacy tasks without a category are treated as Uncategorized.
     */
    getTaskCategory(task) {
        if (
            task.category &&
            this.categories.includes(task.category)
        ) {
            return task.category;
        }

        return 'Uncategorized';
    }

    /**
     * Returns the CSS class for a category badge.
     */
    getCategoryClass(category) {
        const categoryClasses = {
            Work: 'category-work',
            Personal: 'category-personal',
            Shopping: 'category-shopping',
            Uncategorized: 'category-uncategorized'
        };

        return categoryClasses[category] || 'category-uncategorized';
    }

    /**
     * Returns tasks matching the selected category.
     */
    getTasksByCategory(tasks) {
        if (this.activeCategory === 'All') {
            return tasks;
        }

        if (this.activeCategory === 'Uncategorized') {
            return tasks.filter((task) => {
                return this.getTaskCategory(task) === 'Uncategorized';
            });
        }

        return tasks.filter((task) => {
            return this.getTaskCategory(task) === this.activeCategory;
        });
    }

    // ========================================
    // Search and Combined Filtering
    // ========================================

    /**
     * Returns tasks matching search, status and category.
     * All filters are applied together.
     */
    getVisibleTasks() {
        const query = this.searchQuery.trim().toLowerCase();

        // First, apply search and completion-status filtering.
        const matchingTasks = this.tasks.filter((task) => {
            const matchesSearch = task.text
                .toLowerCase()
                .includes(query);

            const matchesStatus =
                this.currentFilter === 'all' ||
                (
                    this.currentFilter === 'completed' &&
                    task.completed
                ) ||
                (
                    this.currentFilter === 'pending' &&
                    !task.completed
                );

            return matchesSearch && matchesStatus;
        });

        // Then apply the category filter to the same result.
        return this.getTasksByCategory(matchingTasks);
    }

    // ========================================
    // Render Tasks
    // ========================================

    /**
     * Displays the tasks matching all active filters.
     */
    renderTasks() {
        const tasksList = this.getElement('tasksList');
        const emptyState = this.getElement('emptyState');
        const noResults = this.getElement('noResults');

        // No tasks exist at all.
        if (this.tasks.length === 0) {
            tasksList.innerHTML = '';
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            noResults.style.display = 'none';
            return;
        }

        // Tasks exist, so the general empty state should be hidden.
        emptyState.style.display = 'none';

        const visibleTasks = this.getVisibleTasks();

        // Tasks exist, but none match the current filters.
        if (visibleTasks.length === 0) {
            tasksList.innerHTML = '';
            tasksList.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        tasksList.style.display = 'flex';

        // Incomplete tasks first, then most recently created.
        const sortedTasks = [...visibleTasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        tasksList.innerHTML = sortedTasks.map((task) => {
            const category = this.getTaskCategory(task);
            const categoryClass = this.getCategoryClass(category);

            const completedClass = task.completed ? 'completed' : '';
            const checkedClass = task.completed ? 'checked' : '';

            const checkedLabel = task.completed
                ? 'Mark task as incomplete'
                : 'Mark task as complete';

            return `
                <div class="task-item ${completedClass}">
                    <div class="task-content">
                        <button
                            type="button"
                            class="task-checkbox ${checkedClass}"
                            onclick="taskFlow.toggleTask(${task.id})"
                            aria-label="${checkedLabel}"
                            aria-pressed="${task.completed}"
                        ></button>

                        <div class="task-details">
                            <span class="task-text">${this.escapeHtml(task.text)}</span>

                            <span class="task-category-badge ${categoryClass}">
                                ${this.escapeHtml(category)}
                            </span>
                        </div>
                    </div>

                    <div class="task-actions">
                        <button
                            type="button"
                            class="task-btn edit-btn"
                            onclick="taskFlow.editTask(${task.id})"
                            aria-label="Edit task"
                            title="Edit task"
                        >✏️</button>

                        <button
                            type="button"
                            class="task-btn delete-btn"
                            onclick="taskFlow.deleteTask(${task.id})"
                            aria-label="Delete task"
                            title="Delete task"
                        >🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // Task Statistics
    // ========================================

    /**
     * Updates statistics for all tasks, regardless of filters.
     */
    updateStats() {
        const totalTasks = this.tasks.length;

        const completedTasks = this.tasks.filter((task) => {
            return task.completed;
        }).length;

        const pendingTasks = totalTasks - completedTasks;

        this.getElement('totalTasks').textContent = totalTasks;
        this.getElement('completedTasks').textContent = completedTasks;
        this.getElement('pendingTasks').textContent = pendingTasks;

        this.getElement('taskCount').textContent =
            `${pendingTasks} pending`;
    }

    // ========================================
    // Local Storage
    // ========================================

    /**
     * Saves tasks and their categories to Local Storage.
     */
    saveTasks() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.tasks)
            );

            localStorage.setItem(
                this.counterKey,
                String(this.taskIdCounter)
            );

            return true;
        } catch (error) {
            console.error('Could not save tasks:', error);

            this.showNotification(
                'Could not save changes. Check your browser storage settings.',
                'error'
            );

            return false;
        }
    }

    /**
     * Loads saved tasks.
     * Legacy tasks without categories remain compatible.
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(this.storageKey);

            if (!savedTasks) {
                return [];
            }

            const parsedTasks = JSON.parse(savedTasks);

            if (!Array.isArray(parsedTasks)) {
                console.warn('Saved tasks data is not an array.');
                return [];
            }

            return parsedTasks
                .filter((task) => this.isValidTask(task))
                .map((task) => ({
                    ...task,
                    createdAt: task.createdAt || new Date().toISOString(),
                    completedAt: task.completedAt || null
                }));
        } catch (error) {
            console.error('Could not load saved tasks:', error);
            return [];
        }
    }

    /**
     * Checks whether a saved task contains required properties.
     */
    isValidTask(task) {
        return (
            task !== null &&
            typeof task === 'object' &&
            Number.isFinite(task.id) &&
            typeof task.text === 'string' &&
            typeof task.completed === 'boolean'
        );
    }

    /**
     * Finds the next available task ID.
     */
    getNextTaskId() {
        let storedCounter = 1;

        try {
            const savedCounter = localStorage.getItem(this.counterKey);

            if (savedCounter !== null) {
                const parsedCounter = Number(savedCounter);

                if (
                    Number.isSafeInteger(parsedCounter) &&
                    parsedCounter > 0
                ) {
                    storedCounter = parsedCounter;
                }
            }
        } catch (error) {
            console.warn(
                'Could not read the saved task counter:',
                error
            );
        }

        const largestExistingId = this.tasks.reduce((largest, task) => {
            return Math.max(largest, task.id);
        }, 0);

        return Math.max(storedCounter, largestExistingId + 1);
    }

    // ========================================
    // HTML Safety
    // ========================================

    /**
     * Escapes user-provided text before inserting it into HTML.
     */
    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ========================================
    // Notifications
    // ========================================

    /**
     * Displays a temporary notification.
     */
    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector(
            '.taskflow-notification'
        );

        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');

        notification.className = 'taskflow-notification';
        notification.textContent = message;
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');

        const notificationColors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#3182ce'
        };

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1000',
            maxWidth: 'calc(100vw - 40px)',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            color: '#ffffff',
            backgroundColor:
                notificationColors[type] || notificationColors.info,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease'
        });

        document.body.appendChild(notification);

        window.setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ========================================
// Application Startup
// ========================================

let taskFlow;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            taskFlow = new TaskFlow();
            window.taskFlow = taskFlow;
        } catch (error) {
            console.error('TaskFlow could not start:', error);
        }
    });
}

// Support importing the class in tests or other JavaScript files.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFlow;
}
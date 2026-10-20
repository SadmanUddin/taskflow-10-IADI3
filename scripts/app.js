'use strict';

/**
 * TaskFlow
 * Task management application with category management.
 *
 * Features:
 * - Create, edit, delete and complete tasks
 * - Work, Personal and Shopping categories
 * - Filter tasks by category
 * - Persist tasks and categories in Local Storage
 * - Support legacy tasks without categories
 */

class TaskFlow {
    constructor() {
        this.storageKey = 'taskflow_tasks';
        this.counterKey = 'taskflow_counter';

        this.categories = ['Work', 'Personal', 'Shopping'];
        this.activeCategory = 'All';

        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();

        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    // ========================================
    // Initialization
    // ========================================

    initializeApp() {
        console.log('TaskFlow initialized successfully.');
    }

    /**
     * Returns an HTML element by ID.
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
        const categoryFilter = this.getElement('categoryFilter');

        addTaskBtn.addEventListener('click', () => {
            this.addTask();
        });

        taskInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.addTask();
            }
        });

        categoryFilter.addEventListener('change', (event) => {
            this.activeCategory = event.target.value;
            this.renderTasks();
        });

        taskInput.addEventListener('input', () => {
            taskInput.setCustomValidity('');
        });
    }

    // ========================================
    // Create Tasks
    // ========================================

    /**
     * Creates a task using the text and category selected by the user.
     */
    addTask() {
        const taskInput = this.getElement('taskInput');
        const categoryInput = this.getElement('taskCategory');

        const taskText = taskInput.value.trim();
        const category = categoryInput.value;

        const MAX_TASK_LENGTH = 500;

        if (!taskText) {
            this.showNotification('Please enter a task description.', 'warning');
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
            this.showNotification('Please select a valid category.', 'warning');
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

        this.showNotification('Task added successfully!', 'success');
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

        this.showNotification('Task deleted successfully!', 'success');
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
            this.showNotification('Task description cannot be empty.', 'warning');
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

        this.showNotification('Task updated successfully!', 'success');
    }

    // ========================================
    // Category Management
    // ========================================

    /**
     * Returns a valid category for a task.
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
     * Returns tasks matching the currently selected category.
     */
    getFilteredTasks() {
        if (this.activeCategory === 'All') {
            return [...this.tasks];
        }

        if (this.activeCategory === 'Uncategorized') {
            return this.tasks.filter((task) => {
                return this.getTaskCategory(task) === 'Uncategorized';
            });
        }

        return this.tasks.filter((task) => {
            return this.getTaskCategory(task) === this.activeCategory;
        });
    }

    // ========================================
    // Render Tasks
    // ========================================

    /**
     * Displays tasks, category labels and the selected filter.
     */
    renderTasks() {
        const tasksList = this.getElement('tasksList');
        const emptyState = this.getElement('emptyState');

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            const heading = emptyState.querySelector('h3');
            const paragraph = emptyState.querySelector('p');

            if (heading && paragraph) {
                if (this.tasks.length === 0) {
                    heading.textContent = 'No tasks yet!';
                    paragraph.textContent =
                        'Add your first task above to get started.';
                } else {
                    heading.textContent = 'No matching tasks';
                    paragraph.textContent =
                        'Try selecting a different category.';
                }
            }

            return;
        }

        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // Incomplete tasks first; completed tasks last.
        const sortedTasks = filteredTasks.sort((a, b) => {
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
     * Updates task counts.
     * Statistics always cover all tasks, not just filtered tasks.
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
     * Loads tasks from Local Storage.
     * Tasks without categories remain valid for backward compatibility.
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
                .map((task) => {
                    // Do not force a category onto legacy tasks.
                    // getTaskCategory() handles missing categories.
                    return {
                        ...task,
                        createdAt: task.createdAt || new Date().toISOString(),
                        completedAt: task.completedAt || null
                    };
                });
        } catch (error) {
            console.error('Could not load saved tasks:', error);
            return [];
        }
    }

    /**
     * Checks whether a saved task has the required properties.
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
            console.warn('Could not read the saved task counter:', error);
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
     * Escapes text before inserting it into HTML.
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
            backgroundColor: notificationColors[type] || notificationColors.info,
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
/**
 * CPS 630 - Assignment 1: Task Manager Client-Side JavaScript
 * Handles API interactions and DOM manipulation
 */

// API Base URL
const API_URL = '/api/items';

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');
const taskCount = document.getElementById('task-count');
const notification = document.getElementById('notification');

// =============================================================================
// NOTIFICATION SYSTEM
// =============================================================================

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type = 'success') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * GET - Fetch all tasks from the server
 */
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.success) {
            renderTasks(result.data);
            updateTaskCount(result.count);
        } else {
            showNotification('Failed to load tasks', 'error');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showNotification('Error connecting to server', 'error');
        renderEmptyState();
    }
}

/**
 * POST - Create a new task
 * @param {Object} taskData - The task data to create
 */
async function createTask(taskData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        const result = await response.json();
        
        if (response.status === 201 && result.success) {
            showNotification('Task created successfully!', 'success');
            fetchTasks(); // Refresh the list
            return true;
        } else {
            showNotification(result.message || 'Failed to create task', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Error connecting to server', 'error');
        return false;
    }
}

/**
 * DELETE - Remove a task by ID
 * @param {number} taskId - The ID of the task to delete
 */
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.status === 200 && result.success) {
            showNotification('Task deleted successfully!', 'success');
            fetchTasks(); // Refresh the list
        } else if (response.status === 404) {
            showNotification('Task not found', 'error');
        } else {
            showNotification(result.message || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error connecting to server', 'error');
    }
}

// =============================================================================
// RENDER FUNCTIONS
// =============================================================================

/**
 * Render the list of tasks
 * @param {Array} tasks - Array of task objects
 */
function renderTasks(tasks) {
    if (!tasksList) return;
    
    if (tasks.length === 0) {
        renderEmptyState();
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <li class="task-item" data-id="${task.id}">
            <div class="task-info">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span class="task-date">📅 ${formatDate(task.createdAt)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-danger" onclick="handleDelete(${task.id})" title="Delete task">
                    🗑️ Delete
                </button>
            </div>
        </li>
    `).join('');
}

/**
 * Render empty state when no tasks exist
 */
function renderEmptyState() {
    if (!tasksList) return;
    
    tasksList.innerHTML = `
        <li class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Add your first task using the form on the left!</p>
        </li>
    `;
}

/**
 * Update the task count display
 * @param {number} count - Number of tasks
 */
function updateTaskCount(count) {
    if (taskCount) {
        taskCount.textContent = count;
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(taskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority')
    };
    
    const success = await createTask(taskData);
    
    if (success) {
        taskForm.reset();
    }
}

/**
 * Handle task deletion
 * @param {number} taskId - ID of the task to delete
 */
function handleDelete(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId);
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only run on the tasks page
    if (taskForm) {
        taskForm.addEventListener('submit', handleSubmit);
    }
    
    // Fetch tasks if we're on the tasks page
    if (tasksList) {
        fetchTasks();
    }
});

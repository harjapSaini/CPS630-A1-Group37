/**
 * CPS 630 - Assignment 1: Multi-page Web Application
 * Group 37 - Task Manager Server
 * 
 * This Express server provides:
 * - Static file serving for HTML, CSS, and JS
 * - REST API endpoints for task management (GET, POST, DELETE)
 * - Multiple HTML page routes
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Path to our JSON data file
const DATA_FILE = path.join(__dirname, 'data', 'items.json');

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Read items from the JSON file
 * @returns {Array} Array of task items
 */
function readItems() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading items file:', error);
        return [];
    }
}

/**
 * Write items to the JSON file
 * @param {Array} items - Array of task items to save
 */
function writeItems(items) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing items file:', error);
    }
}

/**
 * Generate a unique ID for new items
 * @returns {number} New unique ID
 */
function generateId() {
    const items = readItems();
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
}

// =============================================================================
// HTML PAGE ROUTES
// =============================================================================

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tasks/Items management page
app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// =============================================================================
// REST API ENDPOINTS
// =============================================================================

/**
 * GET /api/items
 * Retrieve all items from the list
 * Status Codes: 200 (Success)
 */
app.get('/api/items', (req, res) => {
    const items = readItems();
    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

/**
 * GET /api/items/:id
 * Retrieve a single item by ID
 * Status Codes: 200 (Success), 404 (Not Found)
 */
app.get('/api/items/:id', (req, res) => {
    const items = readItems();
    const id = parseInt(req.params.id);
    const item = items.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: `Item with ID ${id} not found`
        });
    }

    res.status(200).json({
        success: true,
        data: item
    });
});

/**
 * POST /api/items
 * Add a new item to the list
 * Status Codes: 201 (Created), 400 (Bad Request)
 */
app.post('/api/items', (req, res) => {
    const { title, description, priority } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Title is required'
        });
    }

    const items = readItems();
    
    // Create new item
    const newItem = {
        id: generateId(),
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'medium',
        completed: false,
        createdAt: new Date().toISOString()
    };

    items.push(newItem);
    writeItems(items);

    res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: newItem
    });
});

/**
 * DELETE /api/items/:id
 * Delete an item from the list
 * Status Codes: 200 (Success), 404 (Not Found)
 */
app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const items = readItems();
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `Item with ID ${id} not found`
        });
    }

    const deletedItem = items.splice(itemIndex, 1)[0];
    writeItems(items);

    res.status(200).json({
        success: true,
        message: 'Item deleted successfully',
        data: deletedItem
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Handle 404 - Page Not Found
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Handle server errors
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║   🚀 Task Manager Server Running!                      ║
    ║                                                        ║
    ║   Local:  http://localhost:${PORT}                       ║
    ║                                                        ║
    ║   Routes:                                              ║
    ║   • Home:   http://localhost:${PORT}/                    ║
    ║   • Tasks:  http://localhost:${PORT}/tasks               ║
    ║   • About:  http://localhost:${PORT}/about               ║
    ║                                                        ║
    ║   API Endpoints:                                       ║
    ║   • GET    /api/items      - Get all items             ║
    ║   • GET    /api/items/:id  - Get single item           ║
    ║   • POST   /api/items      - Create new item           ║
    ║   • DELETE /api/items/:id  - Delete an item            ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
    `);
});

# Task Manager - CPS 630 Assignment 1

A multi-page web application built with Node.js and Express.js for managing tasks.

**Group 37** | CPS 630 - Web Dev II | Winter 2026

---

## 📖 Overview

### Concept and Purpose

Task Manager is a web-based task management application that allows users to create, view, and delete tasks. The application demonstrates core web development concepts including:

- **Client-Server Architecture**: A Node.js/Express server handles HTTP requests from the browser
- **REST API Design**: Properly implemented GET, POST, and DELETE endpoints with appropriate status codes
- **Static Asset Serving**: CSS, JavaScript, and HTML files served through Express middleware
- **Data Persistence**: Tasks are stored in a JSON file on the server (simulating a database)

The application provides a clean, intuitive interface for managing daily tasks with priority levels (Low, Medium, High).

### Future Extensions

This application was designed with modularity in mind and can be extended in future assignments:

- **Database Integration**: Replace JSON file storage with MongoDB or MySQL
- **User Authentication**: Add login/registration for personalized task lists
- **React Frontend**: Convert to a single-page application with React
- **Task Editing**: Allow users to update existing tasks
- **Categories & Tags**: Organize tasks into categories
- **Due Dates**: Add deadlines and reminder notifications
- **Search & Filter**: Find tasks by title, priority, or date

---

## 📚 Documentation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or extract the project folder**

2. **Navigate to the project directory**
   ```bash
   cd CPS630-A1-Group37
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Project

Start the server with:
```bash
npm start
```

The application will be available at: **http://localhost:3000**

### Project Structure

```
CPS630-A1-Group37/
├── server.js              # Express server with REST API
├── package.json           # Node.js project configuration
├── README.md              # This file
├── data/
│   └── items.json         # JSON data storage for tasks
└── public/
    ├── index.html         # Home page
    ├── tasks.html         # Task management page
    ├── about.html         # About page
    ├── 404.html           # 404 error page
    ├── css/
    │   └── style.css      # Application styles
    └── js/
        └── main.js        # Client-side JavaScript
```

### Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with overview and features |
| `/tasks` | Task management interface (add, view, delete) |
| `/about` | Project information and documentation |
| `/*` | 404 page for invalid routes |

### REST API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/api/items` | Retrieve all tasks | 200 |
| GET | `/api/items/:id` | Retrieve a single task | 200, 404 |
| POST | `/api/items` | Create a new task | 201, 400 |
| DELETE | `/api/items/:id` | Delete a task | 200, 404 |

#### Example API Usage

**Get all tasks:**
```bash
curl http://localhost:3000/api/items
```

**Create a task:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description", "priority": "high"}'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:3000/api/items/1
```

### How to Use

1. **Home Page**: Visit the home page to learn about the application features
2. **Tasks Page**: 
   - Fill out the form on the left to add new tasks
   - View all tasks in the list on the right
   - Click "Delete" to remove a task
3. **About Page**: Learn about the project and API documentation

---

## 💭 Reflection

### Submitted Content

This submission includes:
- ✅ Node.js/Express server (`server.js`)
- ✅ JSON data file (`data/items.json`)
- ✅ 3 HTML pages (Home, Tasks, About) + 404 error page
- ✅ REST API with GET, POST, DELETE endpoints
- ✅ Static assets (CSS styling, client-side JavaScript)
- ✅ This README documentation
- ✅ Demo video (to be added)

### Challenges

1. **Form Handling**: Ensuring proper validation on both client and server sides required careful consideration of edge cases (empty titles, special characters).

2. **State Management**: Without a frontend framework, managing the task list state after API operations required careful DOM manipulation and page refreshing strategies.

3. **Error Handling**: Implementing consistent error responses across all API endpoints while providing helpful feedback to users.

### Successes

1. **Clean Code Organization**: The project follows a clear separation of concerns with distinct files for server logic, data, styles, and client-side scripts.

2. **Responsive Design**: The application works well on both desktop and mobile devices thanks to CSS Grid and Flexbox layouts.

3. **User Experience**: The notification system, smooth transitions, and intuitive interface create a polished user experience.

4. **API Design**: The REST API follows best practices with proper HTTP methods, status codes, and JSON responses.

---

## 👥 Team Members

- Group 37 Members (add your names here)

---

## 📄 License

This project was created for educational purposes as part of CPS 630 at Toronto Metropolitan University.

© 2026 Group 37

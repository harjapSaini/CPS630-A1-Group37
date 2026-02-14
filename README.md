# ShopperPet 🛒

A simple, minimalistic multi-page grocery list web application built with **Node.js** and **Express**.

## Overview

ShopperPet helps you plan and manage your grocery shopping. Add items with details like price, quantity, priority, and store — then view, track, and analyze your spending all in one place.

**Key Features:**

- **Add Items** — Quick form with category, priority, price, and notes
- **Shopping List** — View all items with status tracking (Pending → In Cart → Purchased)
- **Item Details** — Drill into any item for full information
- **Analytics Dashboard** — Spending forecast, category breakdown, spender leaderboard, and budget gauge
- **Download** — Export your list as a `.txt` file

**Future Extensions:**

- Database integration (MongoDB / PostgreSQL) to replace the JSON file
- User authentication and per-user lists
- React or Vue frontend for a richer SPA experience
- Real-time updates via WebSockets

---

## Documentation

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

The app will be available at **http://localhost:3000**.

### Pages

| Route        | Page          | Description                             |
| ------------ | ------------- | --------------------------------------- |
| `/`          | Home          | Landing page with recent items          |
| `/list`      | Shopping List | View all items, toggle status, delete   |
| `/add`       | Add Item      | Form to add a new grocery item          |
| `/item?id=X` | Item Details  | Detailed view of a single item          |
| `/analytics` | Analytics     | Spending dashboard with charts & budget |

### REST API

| Method   | Endpoint        | Description                      | Status Codes |
| -------- | --------------- | -------------------------------- | ------------ |
| `GET`    | `/api/list`     | Get all grocery items            | 200          |
| `GET`    | `/api/list/:id` | Get a single item by ID          | 200 / 404    |
| `POST`   | `/api/list`     | Add a new item                   | 201 / 400    |
| `PATCH`  | `/api/list/:id` | Update item fields (e.g. status) | 200 / 404    |
| `DELETE` | `/api/list/:id` | Remove an item                   | 200 / 404    |

### Data Model

Each grocery item has the following fields:

| Field       | Type   | Description                                |
| ----------- | ------ | ------------------------------------------ |
| `id`        | Number | Auto-assigned unique ID                    |
| `item`      | String | Item name                                  |
| `category`  | String | Produce, Dairy, Meat, Bakery, Frozen, etc. |
| `quantity`  | Number | How many to buy                            |
| `price`     | Number | Estimated price ($)                        |
| `store`     | String | Store name                                 |
| `addedBy`   | String | Who added the item                         |
| `priority`  | String | High / Medium / Low (color-coded)          |
| `status`    | String | Pending / In Cart / Purchased              |
| `notes`     | String | Optional notes                             |
| `dateAdded` | String | ISO date, auto-set by server               |

---

## Reflection

### What Was Built

A full multi-page grocery list application with a Node.js/Express backend serving a REST API and static HTML/CSS/JS frontend pages. Data is persisted in a JSON file (`grocery-data.json`) on the server.

### Challenges

- Keeping the UI clean and minimal while supporting many item fields (priority, status, notes, price, etc.)
- Implementing status toggling (Pending → In Cart → Purchased) with visual feedback (strikethrough, color badges)
- Building a client-side analytics dashboard with Chart.js that computes meaningful insights from raw data

### Successes

- Clean separation between server (API) and client (static pages with fetch-based JS)
- Modular code structure with separate JS files per page
- Responsive design that works well on mobile and desktop
- The analytics page provides real value — spending forecasts, category breakdowns, and a budget gauge

### What We Learned

- **Full Client–Server Workflow**: We gained hands-on experience building and connecting a frontend to a backend using REST principles, understanding how requests, responses, and status codes work together.
- **Planning Before Coding**:Designing routes, data structure, and API responses before implementation reduced bugs and improved overall code clarity.
- **QA Testing**: We understood as a team that there had be unit tests for every possible outcome of the application, as some underlying bugs were not easily recognizable just through development

## Project Status

> 🚧 This project represents the initial version of our application.  
> It serves as a foundational implementation demonstrating REST API integration, client-server communication, and responsive design.  
> Additional features and enhancements are planned for future iterations.

---

_CPS 630 — Assignment 1 — Group 37_

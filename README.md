# ShopperPet

A grocery list web app built for CPS 630 Assignment 1. Made with **Node.js**, **Express**, **MongoDB + Mongoose** on the backend and **React + Vite** on the frontend.

## What is it?

ShopperPet is basically a grocery list manager. You can add grocery items, track them through different statuses (like needed, in cart, purchased), and see some analytics about your spending. We tried to keep the design clean and simple.

Here's what you can do with it:

- **Add Items** - theres a form where you fill in category, priority, price, notes, etc.
- **Shopping List** - see all your items, change their status (Needed -> In Cart -> Purchased -> Consumed), or delete them
- **Item Details** - click on any item to see all its info
- **Edit Items** - you can also edit item details from the detail page
- **Add Users** - a page to register household members by name and age
- **Analytics** - a dashboard that shows spending breakdowns, category charts, and a budget tracker. Right now it only looks at items that are "In Cart". The idea is you'd use it while shopping to estimate how much you'll spend before going to the cashier. Theres also a spender leaderboard so family members could split the bill
- **Download List** - lets you export your list as a `.txt` file. **[x]** means its in cart, **[]** means its still needed

---

## Tech Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Backend  | Node.js + Express               |
| Database | MongoDB + Mongoose              |
| Frontend | React + Vite + React Router     |
| Charts   | Chart.js + react-chartjs-2      |
| Styling  | Vanilla CSS (no CSS frameworks) |

---

## Project Structure

```
CPS630-A1-Group37/
|-- backend/
|   |-- server.js            # Express server + MongoDB connection
|   |-- routes/
|   |   |-- api.js           # REST API routes (CRUD)
|   |-- models/
|   |   |-- GroceryItem.js   # Mongoose schema for grocery items
|   |   |-- User.js          # Mongoose schema for household users
|   |   |-- seed.js          # Seeds test grocery item data on first startup
|   |   |-- userseed.js      # Seeds test user data on first startup
|   |-- package.json
|-- frontend/
|   |-- index.html           # React entry point
|   |-- vite.config.js       # Vite config with API proxy
|   |-- src/
|   |   |-- main.jsx         # React root
|   |   |-- App.jsx          # Router with 5 routes
|   |   |-- style.css        # All styles
|   |   |-- constants.js     # Shared constants
|   |   |-- components/
|   |   |   |-- Navbar.jsx   # Shared navigation bar
|   |   |   |-- Toast.jsx    # Toast notifications
|   |   |-- pages/
|   |       |-- Home.jsx     # Landing page + recent items
|   |       |-- List.jsx     # Shopping list (full CRUD)
|   |       |-- Add.jsx      # Add item form
|   |       |-- AddUser.jsx  # Add user form
|   |       |-- Item.jsx     # Item detail + edit
|   |       |-- Analytics.jsx # Charts + budget gauge
|   |-- public/
|       |-- assets/          # Favicons
|   |-- package.json
|-- .gitignore
|-- README.md
```

---

## How to Run It

You need [Node.js](https://nodejs.org/) (v16+) and [MongoDB](https://www.mongodb.com/) running locally.

### Backend (Express + MongoDB - port 8080)

```bash
cd backend
npm install
npm run start
```

This connects to MongoDB at `mongodb://localhost:27017/shopperpet`, seeds the database with test data if its empty, and starts the API server at **http://localhost:8080**.

### Frontend (React + Vite - port 5173)

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server at **http://localhost:5173**. The Vite proxy forwards all `/api` requests to the backend on port 8080.

### Pages

| Route        | Page          | What it does                           |
| ------------ | ------------- | ----------------------------------     |
| `/`          | Home          | Landing page, shows 3 recent items     |
| `/list`      | Shopping List | All items, change status, delete       |
| `/add`       | Add Item      | Form to add a new grocery item         |
| `/add-user`  | Add User      | Form to register a new  user           |
| `/item/:id`  | Item Details  | View/edit/delete a single item         |
| `/analytics` | Analytics     | Charts and budget tracking             |

### REST API

#### Grocery Items

| Method   | Endpoint        | What it does                  | Status Codes |
| -------- | --------------- | ----------------------------- | ------------ |
| `GET`    | `/api/list`     | Returns all grocery items     | 200          |
| `GET`    | `/api/list/:id` | Returns one item by its ID    | 200 / 404    |
| `POST`   | `/api/list`     | Adds a new item               | 201 / 400    |
| `PATCH`  | `/api/list/:id` | Updates an item (like status) | 200 / 404    |
| `DELETE` | `/api/list/:id` | Deletes an item               | 200 / 404    |

#### Users

| Method   | Endpoint        | What it does                  | Status Codes |
| -------- | --------------- | ----------------------------- | ------------ |
| `GET`    | `/api/users`    | Returns all users             | 200          |
| `POST`   | `/api/users`    | Creates a new user            | 201 / 400    |

### Database Schema (Mongoose)

#### GroceryItem

Each grocery item is stored in MongoDB with the following fields and validation:

| Field       | Type   | Validation                                      |
| ----------- | ------ | ----------------------------------------------- |
| `id`        | Number | Required, unique, min 1                         |
| `item`      | String | Required, trimmed, 1-100 chars                  |
| `category`  | String | Required, must be one of 9 allowed categories   |
| `quantity`  | Number | Required, whole number, min 1                   |
| `price`     | Number | Min 0, max 99999                                |
| `store`     | String | Trimmed, max 100 chars                          |
| `addedBy`   | String | Trimmed, max 50 chars, defaults to "Anonymous"  |
| `priority`  | String | Must be Low / Medium / High                     |
| `status`    | String | Must be Needed / In Cart / Purchased / Consumed |
| `notes`     | String | Trimmed, max 500 chars                          |
| `dateAdded` | String | Must match YYYY-MM-DD format                    |

#### User

Household members are stored with the following fields and validation:

| Field       | Type   | Validation                                      |
| ----------- | ------ | ----------------------------------------------- |
| `name`      | String | Required, trimmed                               |
| `age`       | Number | Required, min 1, max 120                        |
| `createdAt` | Date   | Auto-set to current date/time                   |

### Seed Function

On startup, the backend checks if the `groceryitems` collection is empty. If it is, it inserts 8 test items automatically. If the database already has data, it skips seeding. This is handled by `models/seed.js`.

---

## Reflection

### What we built

We made a full multi-page grocery app with a Node/Express backend that serves a REST API, and the frontend is just static HTML/CSS/JS files. The project is split into a `backend/` and `frontend/` monorepo layout.

### Challenges we ran into

- Trying to keep the UI looking clean when theres so many fields per item (priority, status, notes, price, store, etc.) was harder than we thought
- Getting the status toggling to work smoothly (Needed -> In Cart -> Purchased -> Consumed) with the colored badges took some trial and error
- The analytics page was tricky - we used Chart.js and had to figure out how to compute the stats from the raw data on the client side
- Migrating from plain HTML/JS to React while keeping all the same functionality
- Setting up the Vite proxy so the React frontend could talk to the Express API during development

### What went well

- The monorepo structure keeps backend and frontend cleanly separated
- React components make the code much more reusable - the Navbar and Toast are shared across all pages
- The Mongoose schema with validation catches bad data before it hits the database
- Analytics page actually turned out to be useful - the spending forecast and budget gauge are pretty cool

### What we learned

- **Full-Stack Development**: Got hands-on experience connecting a React frontend to an Express backend with REST and MongoDB.
- **React + Vite**: Learned how to build a multi-view SPA with React Router and how Vite's proxy simplifies API calls during development.
- **MongoDB + Mongoose**: Learned about schema design, validation, and how Mongoose makes working with MongoDB much easier.
- **Planning first**: We designed the routes, data structure, and API responses before jumping into code. Definitely saved us time and headaches down the road.

### Version Control

We used **Git** and **GitHub** for version control throughout the project. Each team member worked on their own branch and we merged changes through pull requests. This helped us avoid stepping on each other's code and made it easy to roll back if something broke.

## Project Status

> This is the second version of our app for A2, built on top of A1.
> It covers the basics: React+Vite frontend, Express+MongoDB backend, REST API, and a responsive UI.
> We'll be adding more stuff when A3 comes around.

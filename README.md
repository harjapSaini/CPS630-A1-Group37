# ShopperPet

A grocery list web app built for CPS 630 Assignment 3. Made with **Node.js**, **Express**, **MongoDB + Mongoose** on the backend and **React + Vite** on the frontend.

## What is it?

ShopperPet is basically a grocery list manager. You can add grocery items, track them through different statuses (like needed, in cart, purchased), and see some analytics about your spending. All of this through secure authentication and with real-time updates. We tried to keep the design clean and simple, by following Nielsen's usability principles.

Here's what you can do with it:

- **Add Items** - theres a form where you fill in category, priority, price, notes, etc. The "Added By" field is automatically set to the logged-in user
- **Shopping List** - see all your items, change their status (Needed -> In Cart -> Purchased -> Consumed), or delete them
- **Item Details** - click on any item to see all its info
- **Edit Items** - you can also edit item details from the detail page ("Added By" is read-only and cannot be reassigned)
- **Analytics** - a dashboard that shows spending breakdowns, category charts, and a budget tracker. Right now it only looks at items that are "In Cart". The idea is you'd use it while shopping to estimate how much you'll spend before going to the cashier. Theres also a spender leaderboard so family members could split the bill
- **Download List** - lets you export your list as a `.txt` file. **[x]** means its in cart, **[]** means its still needed
- **User Authentication** - Secure login and registration. Unauthenticated users cannot view or edit the household grocery list.
- **Real-Time Syncing** - Powered by Socket.io, now if a family member adds or checks off an item from another device, it instantly updates on your screen without refreshing the page.
- **User Profiles & Directory** - Family members can edit their display names and change passwords, and view a directory of everyone currently in the household.


---

## Tech Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Backend  | Node.js + Express               |
| Database | MongoDB + Mongoose              |
| Frontend | React + Vite + React Router     |
| Charts   | Chart.js + react-chartjs-2      |
| Styling  | Vanilla CSS (no CSS frameworks) |
| Security  | JSON Web Tokens (JWT) + bcrypt |
| Real-Time  | Socket IO |

---

## Project Structure

```
CPS630-A3-Group37/
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
|   |   |   |-- ProtectedRoute.jsx # Page protection
|   |   |-- pages/
|   |       |-- Login.jsx     # Login page
|   |       |-- Profile.jsx   # User profile to edit
|   |       |-- Register.jsx  # User Registration page
|   |       |-- Users.jsx     # List of users in app page
|   |       |-- Home.jsx     # Landing page + recent items
|   |       |-- List.jsx     # Shopping list (full CRUD)
|   |       |-- Add.jsx      # Add item form
|   |       |-- Item.jsx     # Item detail + edit
|   |       |-- Analytics.jsx # Charts + budget gauge
|   |-- src/
|   |   |-- assests / # Images
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


### Test Accounts
You can log in immediately using the seeded accounts (username / password / userId):

* #### `mom / password123 / userId: 1`
* #### `dad / password123 / userId: 2`
* #### `bro / password123 / userId: 3`
* #### `sis / password123 / userId: 4`

*(Note: Make sure to delete old database and browser cache before running A3 changes!!!)*

### Pages

| Route        | Page          | What it does                           |
| ------------ | ------------- | ----------------------------------     |
| `/`          | Home          | Landing page, shows 3 recent items (Protected)    |
| `/login`          | Login          | Authenticates user & provides JWT (Public)     |
| `/register`          | Register          | Creates a new user account (Public)     |
| `/list`      | Shopping List | All items, change status, delete (Protected)       |
| `/add`       | Add Item      | Form to add a new grocery item (Protected)        |
| `/item/:id`  | Item Details  | View/edit/delete a single item (Protected)        |
| `/analytics` | Analytics     | Charts and budget tracking  (Protected)           |
| `/users` | Users     | Directory of all users  (Protected)           |
| `/profile` | Profile     | Update display name and password (Protected)           |


### REST API

*(Note: All endpoints below except `/auth` are protected and require a valid JWT Bearer token in the `Authorization` header. Missing or invalid tokens will return a `401` or `403` error).*

#### Authentication

| Method   | Endpoint             | What it does                  | Status Codes |
| -------- | -------------------- | ----------------------------- | ------------ |
| `POST`   | `/api/auth/login`    | Verifies bcrypt & returns JWT | 200 / 401    |
| `POST`   | `/api/auth/register` | Creates account & hashes pass | 201 / 400    |

#### Grocery Items

| Method   | Endpoint        | What it does                  | Socket Event   | Status Codes    |
| -------- | --------------- | ----------------------------- | -------------- | --------------- |
| `GET`    | `/api/list`     | Returns all grocery items     | -              | 200 / 401       |
| `GET`    | `/api/list/:id` | Returns one item by its ID    | -              | 200 / 401 / 404 |
| `POST`   | `/api/list`     | Adds a new item               | `list-updated` | 201 / 400 / 401 |
| `PATCH`  | `/api/list/:id` | Updates an item (like status) | `list-updated` | 200 / 401 / 404 |
| `DELETE` | `/api/list/:id` | Deletes an item               | `list-updated` | 200 / 401 / 404 |

#### Users

| Method   | Endpoint         | What it does                  | Socket Event    | Status Codes    |
| -------- | ---------------- | ----------------------------- | --------------- | --------------- |
| `GET`    | `/api/users`     | Returns all users             | -               | 200 / 401       |
| `PATCH`  | `/api/users/:id` | Updates profile/password      | `users-updated` | 200 / 401 / 404 |


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
| `addedBy`   | String | Stores the `userId` of the user who added the item. Trimmed, max 50 chars, defaults to "Anonymous"  |
| `priority`  | String | Must be Low / Medium / High                     |
| `status`    | String | Must be Needed / In Cart / Purchased / Consumed |
| `notes`     | String | Trimmed, max 500 chars                          |
| `dateAdded` | String | Must match YYYY-MM-DD format                    |

#### User

Household members are stored with the following fields and validation:

| Field       | Type   | Validation                                      |
| ----------- | ------ | ----------------------------------------------- |
| `userId`    | Number | Required, unique, auto-incremented, min 1       |
| `name`      | String | Required, trimmed                               |
| `username`  | String | Required, unique, lowercase                     |
| `password`  | String | Required (Stored as a bcrypt hash)              |
| `createdAt` | Date   | Auto-set to current date/time                   |

### Seed Function

On startup, the backend checks if the `users` and `groceryitems` collections are empty. If they are, it automatically hashes the passwords for the test users, assigns them sequential `userId` values (1-4), inserts them, and then links the test grocery items to those `userId` values via the `addedBy` field. If the database already has data, it skips seeding. This is handled by `models/userseed.js` and `models/seed.js`.

---

## Reflection for A3


### What we built

For Assignment 3, we evolved our MERN prototype into a fully secure, real-time application. We introduced JSON Web Tokens for authentication, bcrypt for password encryption, and Socket.io for live data synchronization across multiple clients. The project is split into a `backend/` and `frontend/` monorepo layout.

### Challenges we ran into

- **The Database Seeding Nightmare:** When we upgraded our app to use real MongoDB `_id` references instead of just plain text names for the `addedBy` field, our server crashed on startup. We later on realized our grocery seed file was trying to attach User IDs before the User seed file had even finished running! We had to rewrite our `server.js` code to force the database to seed in the exact right order.
- **The Socket.io 404 Error:** We spent a while trying to figure out why our React frontend was getting a 404 error when trying to connect to the websocket. It turned out Express uses `app.listen()`, but Socket.io requires you to wrap the app in a standard Node `http.createServer()`. Finding that one line of code was a huge relief at end of the day.
- **Breaking our own Database:** When we finally got `bcrypt` working, we realized we locked ourselves out of all our old test accounts because the database was looking for a hash, but our old passwords were saved in plain text format. We had to write a loop in our seed file to hash the default passwords.
- **The Navbar Glitch:** Getting the Navbar to update the username instantly when you edit your profile was annoying. First we did it using socket.io. But, it kept reading the old name from local storage before the database actually updated it because of a race condition. We ended up using custom browser events to force them to sync up. We learned in that case, we don't need socket io.
- **The Back Button Glitch:** We realized that even after you log out, you could just hit the browser's "Back" button and still see the protected grocery list in the `api/list`. We had to figure out how to add strict `Cache-Control` headers on the backend to force the browser to forget the data once you log out.

### What went well

- Adding Socket.io was honestly easier than we expected. Since our React frontend and Express backend were already separated, it was just a matter of making them broadcast to each other on the same port.
- The UI naturally checked off Nielsen's usability rules. Things like the Toast notifications popping up to tell you what's happening, and the `<select>` dropdowns preventing people from making typos.
- The `Login Wall` worked perfectly. We figured out how to conditionally hide the Navbar completely on the Login and Register screens so unauthenticated users literally have nowhere else to click.

### What we learned

- **Security basics:** We learned why saving passwords as plain text in the database is a terrible idea, and how bcrypt actually works to scramble them with salts.
- **Middleware:** We learned how Express middleware actually works. It acts like a security guard that checks for a JWT Bearer token before letting any fetch requests touch the database.
- **Real-Time web:** We understood how WebSockets actually work to keep a two-way connection open, instead of just doing standard HTTP fetch requests.

### Version Control

We used **Git** and **GitHub** for version control throughout the project. Each team member worked on their own branch and we merged changes through pull requests. This helped us avoid stepping on each other's code and made it easy to roll back if something broke.

## Project Status

> This is the third and final version of our app for A3.
> It features a complete MERN stack, secure JWT authentication, and live Socket.io updates!

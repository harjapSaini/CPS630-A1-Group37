# ShopperPet

A grocery list web app we built for CPS 630 Assignment 1. It's made with **Node.js**, **Express**, and plain **HTML/CSS/JS** - no frameworks on the frontend.

## What is it?

ShopperPet is basically a grocery list manager. You can add grocery items, track them through different statuses (like needed, in cart, purchased), and see some analytics about your spending. We tried to keep the design clean and simple.

Here's what you can do with it:

- **Add Items** - theres a form where you fill in category, priority, price, notes, etc.
- **Shopping List** - see all your items, change their status (Needed → In Cart → Purchased → Consumed), or delete them
- **Item Details** - click on any item to see all its info
- **Edit Items** - you can also edit item details from the detail page
- **Analytics** - a dashboard that shows spending breakdowns, category charts, and a budget tracker. Right now it only looks at items that are "In Cart". The idea is you'd use it while shopping to estimate how much you'll spend before going to the cashier. Theres also a spender leaderboard so family members could split the bill
- **Download List** - lets you export your list as a `.txt` file. **[x]** means its in cart, **[]** means its still needed

**Stuff we want to add later:**

- Hook it up to MongoDB instead of using a JSON file (prof mentioned this for future assignments)
- Maybe add user login so different people can have their own lists
- Possibly redo the frontend in React so we can reuse components

---

## How to Run It

You need [Node.js](https://nodejs.org/) (v16+).

### Backend (Express server - port 8080)

```bash
cd backend
npm install
npm start
```

Then go to **http://localhost:8080** in your browser. This runs the full app - the Express server serves both the API and the frontend static files.

### Frontend (Vite dev server - port 5173)

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server at **http://localhost:5173**. Right now its just a scaffold for future development - the actual app pages are still served by the backend.

### Pages

| Route        | Page          | What it does                          |
| ------------ | ------------- | ------------------------------------- |
| `/`          | Home          | Landing page, shows some recent items |
| `/list`      | Shopping List | All your items, change status, delete |
| `/add`       | Add Item      | Form to add a new grocery item        |
| `/analytics` | Analytics     | Charts and budget tracking            |
| `/item?id=x` | Item Details  | See all info for one item             |
| `/item?id=x` | Edit Item     | Edit that item's details              |

### API Endpoints

We built a REST API that the frontend talks to using fetch. Here are the routes:

| Method   | Endpoint        | What it does                  | Status Codes |
| -------- | --------------- | ----------------------------- | ------------ |
| `GET`    | `/api/list`     | Returns all grocery items     | 200          |
| `GET`    | `/api/list/:id` | Returns one item by its ID    | 200 / 404    |
| `POST`   | `/api/list`     | Adds a new item               | 201 / 400    |
| `PATCH`  | `/api/list/:id` | Updates an item (like status) | 200 / 404    |
| `DELETE` | `/api/list/:id` | Deletes an item               | 200 / 404    |

### Data Model

Each grocery item looks like this:

| Field       | Type   | Description                                |
| ----------- | ------ | ------------------------------------------ |
| `id`        | Number | Auto-assigned unique ID                    |
| `item`      | String | Item name                                  |
| `category`  | String | Produce, Dairy, Meat, Bakery, Frozen, etc. |
| `quantity`  | Number | How many to buy                            |
| `price`     | Number | Estimated price ($)                        |
| `store`     | String | Store name                                 |
| `addedBy`   | String | Who added the item                         |
| `priority`  | String | High / Medium / Low                        |
| `status`    | String | Needed / In Cart / Purchased / Consumed    |
| `notes`     | String | Optional notes                             |
| `dateAdded` | String | ISO date, auto-set when item is created    |

---

## Reflection

### What we built

We made a full multi-page grocery app with a Node/Express backend that serves a REST API, and the frontend is just static HTML/CSS/JS files. The project is split into a `backend/` and `frontend/` monorepo layout. All the data gets saved to a JSON file (`grocery-data.json`) on the server for now - we'll probably switch to a database later.

### Challenges we ran into

- Trying to keep the UI looking clean when theres so many fields per item (priority, status, notes, price, store, etc.) was harder than we thought
- Getting the status toggling to work smoothly (Needed → In Cart → Purchased → Consumed) with the colored badges took some trial and error
- The analytics page was tricky - we used Chart.js and had to figure out how to compute the stats from the raw data on the client side
- Keeping things modular so we didn't end up with one giant file

### What went well

- We kept the server and client code pretty separate which made things easier to debug
- Each page has its own JS file so its not all jammed into one script
- The design works on mobile too which is nice
- Analytics page actually turned out to be useful - the spending forecast and budget gauge are pretty cool

### What we learned

- **Client-Server stuff**: Got hands-on experience connecting a frontend to a backend with REST. Understanding how requests, responses, and status codes fit together was really helpful.
- **Planning first**: We designed the routes, data structure, and API responses before jumping into code. Definitely saved us time and headaches down the road.
- **Testing matters**: We realized pretty quickly that we needed tests for edge cases. Some bugs were not obvious at all just from using the app manually.

### Version Control

We used **Git** and **GitHub** for version control throughout the project. Each team member worked on their own branch and we merged changes through pull requests. This helped us avoid stepping on each other's code and made it easy to roll back if something broke. We also used commits to track progress and keep a history of what was changed and why.

## Project Status

> This is the first version of our app - just enough for A1.
> It covers the basics: REST API, client-server communication, and a responsive UI.
> We'll be adding more stuff when A2 and A3 come around.

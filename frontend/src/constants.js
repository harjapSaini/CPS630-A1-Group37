// status lifecycle for grocery items
export const lifecycle = ["Needed", "In Cart", "Purchased", "Consumed"];

// css class for each status
export const statusConfig = {
  "Needed": {
    class: "status-needed"
  },
  "In Cart": {
    class: "status-in-cart"
  },
  "Purchased": {
    class: "status-purchased"
  },
  "Consumed": {
    class: "status-consumed"
  },
  "Planning": {
    class: "status-planning"
  },
  "Active": {
    class: "status-active"
  },
  "Completed": {
    class: "status-completed"
  }
};

// status lifecycle for trips
export const tripLifecycle = ["Planning", "Active", "Completed"];

// colors for charts
export const chartColors = [
  "#2a9d8f",
  "#e63946",
  "#f4a261",
  "#264653",
  "#e9c46a",
  "#606c38",
  "#457b9d",
  "#bc6c25",
  "#6a4c93",
  "#1d3557"
];

// categories for dropdowns
export const categories = ["Produce", "Dairy", "Meat", "Bakery", "Frozen", "Beverages", "Snacks", "Household", "Other"];

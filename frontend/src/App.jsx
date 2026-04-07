import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import List from "./pages/List";
import Add from "./pages/Add";
import Item from "./pages/Item";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Trips from "./pages/Trips";
import NewTrip from "./pages/NewTrip";
import TripDetail from "./pages/TripDetail";

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> 
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route element={<ProtectedRoute />}>
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<List />} />
            <Route path="/add" element={<Add />} />
            <Route path="/item/:id" element={<Item />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/new" element={<NewTrip />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
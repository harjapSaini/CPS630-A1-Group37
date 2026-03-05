import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import List from "./pages/List";
import Add from "./pages/Add";
import Item from "./pages/Item";
import Analytics from "./pages/Analytics";
import AddUser from "./pages/AddUser";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<List />} />
        <Route path="/add" element={<Add />} />
        <Route path="/item/:id" element={<Item />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/add-user" element={<AddUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

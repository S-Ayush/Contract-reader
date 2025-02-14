import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Interact from "./pages/Interact";
import Signature from "./pages/Signature";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="interact/:id" element={<Interact />} />
          <Route path="interact/:id/:visibility" element={<Interact />} />
          <Route path="signature" element={<Signature />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

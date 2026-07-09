import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Onboarding from "./pages/Onboarding.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

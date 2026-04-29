import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import LandingPage from "./LandingPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

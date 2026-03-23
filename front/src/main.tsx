import { BrowserRouter, Routes, Route } from "react-router-dom"
import { StrictMode } from "react";
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import {createRoot} from "react-dom/client";
import ProtectedRoute from "./pages/ProtectedRoute.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/home" element={
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
            }/>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)

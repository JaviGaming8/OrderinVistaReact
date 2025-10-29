import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Moon, Sun } from "lucide-react";
import OrdersView from "./pages/OrdersView";
import HomeView from "./pages/HomeView";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState("Inicio"); // vista por defecto

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const renderView = () => {
    switch (activeView) {
      case "Pedidos":
        return <OrdersView darkMode={darkMode} />;
      case "Inicio":
      default:
        return <HomeView darkMode={darkMode} />;
    }
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      {/* Botón flotante para modo oscuro */}
      <div className="theme-toggle" onClick={toggleDarkMode}>
        <div className={`toggle-track ${darkMode ? "dark" : ""}`}>
          <div className={`toggle-thumb ${darkMode ? "dark" : ""}`}>
            {darkMode ? (
              <Moon color="#FFD700" size={20} />
            ) : (
              <Sun color="#FFA500" size={20} />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar con función de cambio */}
      <Sidebar darkMode={darkMode} onSelectView={setActiveView} />

      {/* Contenido principal */}
      <main className="main-content">{renderView()}</main>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Moon, Sun } from "lucide-react";
import OrdersView from "./pages/OrdersView";
import HomeView from "./pages/HomeView";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("Inicio");

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
      {/* Toggle modo oscuro */}
      <div className="theme-toggle" onClick={toggleDarkMode}>
        <div className={`toggle-track ${darkMode ? "dark" : ""}`}>
          <div className={`toggle-thumb ${darkMode ? "dark" : ""}`}>
            {darkMode ? <Moon color="#FFD700" size={20} /> : <Sun color="#FFA500" size={20} />}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        darkMode={darkMode}
        onSelectView={setActiveView}
        open={sidebarOpen}
        toggleSidebar={toggleSidebar} // se controla desde el botón interno
      />

      {/* Contenido principal */}
      <main className={`main-content ${sidebarOpen ? "with-sidebar" : "collapsed-sidebar"}`}>
        {renderView()}
      </main>
    </div>
  );
}

export default App;

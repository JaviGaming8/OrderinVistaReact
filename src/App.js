import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Moon, Sun } from "lucide-react";
import OrdersView from "./pages/OrdersView";
import HomeView from "./pages/HomeView";
import Login from "./pages/Login";
import MensajesView from "./pages/MensajesView";
import ProductsView from "./pages/ProductsView";   // ✅ IMPORTANTE
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("Inicio");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica sesión almacenada
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Login
  const handleLogin = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveView("Inicio");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  // Control de vistas
  const renderView = () => {
    switch (activeView) {
      case "Pedidos":
        return <OrdersView darkMode={darkMode} user={user} />;

      case "Mensajes":
        return <MensajesView darkMode={darkMode} user={user} />;

      case "Productos":  // 🔥 AQUÍ ESTABA EL ERROR
        return <ProductsView darkMode={darkMode} user={user} />;

      case "Inicio":
      default:
        return <HomeView darkMode={darkMode} user={user} />;
    }
  };

  // Cargando sesión
  if (loading) {
    return (
      <div className={`app-container ${darkMode ? "dark" : ""}`}>
        <div className="loading-container">
          <div className="loading-spinner">Cargando...</div>
        </div>
      </div>
    );
  }

  // No autenticado
  if (!isAuthenticated) {
    return (
      <div className={`app-container ${darkMode ? "dark" : ""}`}>
        <Login onLogin={handleLogin} darkMode={darkMode} />
      </div>
    );
  }

  // App principal
  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      {/* Toggle modo oscuro */}
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

      {/* Sidebar */}
      <Sidebar
        darkMode={darkMode}
        onSelectView={setActiveView}
        open={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        user={user}
      />

      {/* Contenido principal */}
      <main
        className={`main-content ${
          sidebarOpen ? "with-sidebar" : "collapsed-sidebar"
        }`}
      >
        {renderView()}
      </main>
    </div>
  );
}

export default App;

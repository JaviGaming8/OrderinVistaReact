import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Moon, Sun } from "lucide-react";
import OrdersView from "./pages/OrdersView";
import HomeView from "./pages/HomeView";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("Inicio");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    // CORRECCIÓN: Verificar que userData no sea null o undefined antes de parsear
    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
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
  
  // Función para manejar el login exitoso
  const handleLogin = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Guardar en localStorage para persistir la sesión
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveView("Inicio");
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const renderView = () => {
    switch (activeView) {
      case "Pedidos":
        return <OrdersView darkMode={darkMode} user={user} />;
      case "Inicio":
      default:
        return <HomeView darkMode={darkMode} user={user} />;
    }
  };

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className={`app-container ${darkMode ? "dark" : ""}`}>
        <div className="loading-container">
          <div className="loading-spinner">Cargando...</div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar solo el login
  if (!isAuthenticated) {
    return (
      <div className={`app-container ${darkMode ? "dark" : ""}`}>
        <Login onLogin={handleLogin} darkMode={darkMode} />
      </div>
    );
  }

  // Si está autenticado, mostrar la aplicación completa
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

      {/* Sidebar - agregar opción de logout */}
      <Sidebar
        darkMode={darkMode}
        onSelectView={setActiveView}
        open={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        user={user}
      />

      {/* Contenido principal */}
      <main className={`main-content ${sidebarOpen ? "with-sidebar" : "collapsed-sidebar"}`}>
        {renderView()}
      </main>
    </div>
  );
}

export default App;
import React from "react";
import {
  Home,
  ShoppingBag,
  Calendar,
  MessageSquare,
  BarChart,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ darkMode, onSelectView, open, toggleSidebar }) => {
  const menuItems = [
    { icon: <Home size={22} />, label: "Inicio" },
    { icon: <ShoppingBag size={22} />, label: "Pedidos" },
    { icon: <Calendar size={22} />, label: "Agenda" },
    { icon: <MessageSquare size={22} />, label: "Mensajes" },
    { icon: <BarChart size={22} />, label: "Reportes" },
    { icon: <Settings size={22} />, label: "Configuración" },
  ];

  return (
    <div className={`sidebar ${open ? "open" : "collapsed"} ${darkMode ? "dark" : ""}`}>
      <div className="sidebar-header">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>

      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className="menu-item"
            onClick={() => onSelectView(item.label)}
          >
            {item.icon}
            {open && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      <div className="logout-section">
        <LogOut size={22} />
        {open && <span>Cerrar sesión</span>}
      </div>
    </div>
  );
};

export default Sidebar;

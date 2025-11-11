import React from "react";
import { ShoppingCart, Box, Users, DollarSign } from "lucide-react";
import "./HomeView.css";

const HomeView = ({ darkMode }) => {
  // Datos de ejemplo, en tu app los puedes reemplazar por props o API
  const stats = [
    { id: 1, title: "Pedidos Totales", value: 128, icon: <ShoppingCart /> },
    { id: 2, title: "Productos", value: 54, icon: <Box /> },
    { id: 3, title: "Clientes", value: 42, icon: <Users /> },
    { id: 4, title: "Ingresos", value: "$12,450", icon: <DollarSign /> },
  ];

  return (
    <div className={`home-container ${darkMode ? "dark" : ""}`}>
      <h1 className="home-title">Dashboard</h1>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="welcome-card">
        <h2>Bienvenido al sistema de pedidos</h2>
        <p>
          Administra tus productos, órdenes y clientes de manera fácil y rápida.
        </p>
      </div>
    </div>
  );
};

export default HomeView;

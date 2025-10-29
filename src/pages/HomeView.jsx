import React from "react";

const HomeView = ({ darkMode }) => {
  return (
    <div className={`view-container ${darkMode ? "dark" : ""}`}>
      <h1>Página de inicio</h1>
    </div>
  );
};

export default HomeView;

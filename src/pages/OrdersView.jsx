import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, Eye, X, ChevronLeft } from "lucide-react";
import "./OrdersView.css";

function OrdersView({ darkMode = false, sidebarCollapsed = false }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    totalPrice: 0,
    firstName: "",
    lastName: "",
    emailAddress: "",
    addressLine: "",
    country: "",
    state: "",
    zipCode: "",
    cardName: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
    paymentMethod: 0,
  });

  // ==================== API ====================
  const fetchAllOrders = async () => {
    try {
      const res = await fetch("http://localhost:32770/api/v1/Order/all");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    }
  };

  const fetchOrdersByUsername = async (username) => {
    try {
      const res = await fetch(`http://localhost:32770/api/v1/Order/${username}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error cargando pedidos por usuario:", err);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const res = await fetch("http://localhost:32770/api/v1/Order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        alert("Pedido creado exitosamente");
        setShowModal(false);
        fetchAllOrders();
      } else {
        alert("Error al crear el pedido");
      }
    } catch (err) {
      console.error("Error creando pedido:", err);
    }
  };

  const updateOrder = async (orderData) => {
    try {
      const res = await fetch("http://localhost:32770/api/v1/Order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (res.ok || res.status === 204) {
        alert("Pedido actualizado exitosamente");
        setShowModal(false);
        fetchAllOrders();
      } else {
        alert("Error al actualizar el pedido");
      }
    } catch (err) {
      console.error("Error actualizando pedido:", err);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este pedido?")) return;
    try {
      const res = await fetch(`http://localhost:32770/api/v1/Order/${id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        alert("Pedido eliminado exitosamente");
        fetchAllOrders();
      } else {
        alert("Error al eliminar el pedido");
      }
    } catch (err) {
      console.error("Error eliminando pedido:", err);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchAllOrders();
  }, []);

  // ==================== FILTRO ====================
  const handleSearch = () => {
    const username = search.trim();
    if (!username) fetchAllOrders();
    else fetchOrdersByUsername(username);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.userName?.toLowerCase().includes(search.toLowerCase()) ||
      order.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      order.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      order.emailAddress?.toLowerCase().includes(search.toLowerCase())
  );

  // ==================== MODALES ====================
  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      userName: "",
      totalPrice: 0,
      firstName: "",
      lastName: "",
      emailAddress: "",
      addressLine: "",
      country: "",
      state: "",
      zipCode: "",
      cardName: "",
      cardNumber: "",
      expiration: "",
      cvv: "",
      paymentMethod: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setModalMode("edit");
    setFormData({ ...order });
    setShowModal(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  // ==================== FORM ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["totalPrice", "paymentMethod"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const isFormValid = Object.keys(formData).every(
    (key) => formData[key] !== "" && formData[key] !== null
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return alert("Por favor completa todos los campos");
    modalMode === "create" ? createOrder(formData) : updateOrder(formData);
  };

  // ==================== RENDER ====================
  return (
    <div
      className={`orders-container ${darkMode ? "dark" : ""} ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* HEADER */}
      <div className="orders-header">
        <h2 className="orders-title">Pedidos</h2>
        <div className="orders-actions">
          <div className="search-box">
            <Search size={18} color={darkMode ? "#f5f5f5" : "#6b7280"} />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button className="create-btn" onClick={handleCreate}>
            <Plus size={18} /> Crear nuevo
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="orders-table-container">
        {filteredOrders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userName}</td>
                  <td>
                    {order.firstName} {order.lastName}
                  </td>
                  <td>{order.emailAddress}</td>
                  <td className="total-price">${order.totalPrice}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(order)}
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(order)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteOrder(order.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No se encontraron pedidos.</div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === "create" ? "Crear Pedido" : "Editar Pedido"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-grid">
              {Object.keys(formData).map(
                (key) =>
                  key !== "id" && (
                    <div className="form-group" key={key}>
                      <label>{key.replace(/([A-Z])/g, " $1").trim()}</label>
                      {key === "paymentMethod" ? (
                        <select
                          name={key}
                          value={formData[key]}
                          onChange={handleInputChange}
                        >
                          <option value={0}>Tarjeta Crédito</option>
                          <option value={1}>Tarjeta Débito</option>
                          <option value={2}>Paypal</option>
                        </select>
                      ) : (
                        <input
                          type={["totalPrice"].includes(key) ? "number" : "text"}
                          name={key}
                          value={formData[key]}
                          onChange={handleInputChange}
                          required
                        />
                      )}
                    </div>
                  )
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleSubmit}
              >
                {modalMode === "create" ? "Crear" : "Actualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETALLES DEL PEDIDO */}
      {showDetails && selectedOrder && (
        <div className="details-overlay" onClick={() => setShowDetails(false)}>
          <div className="details-panel" onClick={(e) => e.stopPropagation()}>
            {/* HEADER DEL PANEL */}
            <div className="details-header">
              <button
                className="back-button"
                onClick={() => setShowDetails(false)}
              >
                <ChevronLeft size={20} /> Volver
              </button>
              <h2>Detalles del Pedido</h2>
              <button
                className="close-button"
                onClick={() => setShowDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* BADGE DEL ID */}
            <div className="order-badge">Pedido #{selectedOrder.id}</div>

            {/* GRID DE CARDS */}
            <div className="details-cards">
              {/* CARD 1 - INFORMACIÓN PERSONAL */}
              <div className="details-card personal">
                <h3>Información Personal</h3>
                <div className="detail-field">
                  <p className="detail-label">Usuario</p>
                  <p className="detail-value">{selectedOrder.userName}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Nombre completo</p>
                  <p className="detail-value">
                    {selectedOrder.firstName} {selectedOrder.lastName}
                  </p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Email</p>
                  <p className="detail-value">{selectedOrder.emailAddress}</p>
                </div>
              </div>

              {/* CARD 2 - DIRECCIÓN DE ENVÍO */}
              <div className="details-card shipping">
                <h3>Dirección de Envío</h3>
                <div className="detail-field">
                  <p className="detail-label">Dirección</p>
                  <p className="detail-value">{selectedOrder.addressLine}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">País</p>
                  <p className="detail-value">{selectedOrder.country}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Estado</p>
                  <p className="detail-value">{selectedOrder.state}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Código Postal</p>
                  <p className="detail-value">{selectedOrder.zipCode}</p>
                </div>
              </div>

              {/* CARD 3 - INFORMACIÓN DE PAGO */}
              <div className="details-card payment">
                <h3>Información de Pago</h3>
                <div className="detail-field">
                  <p className="detail-label">Nombre en tarjeta</p>
                  <p className="detail-value">{selectedOrder.cardName}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Número de tarjeta</p>
                  <p className="detail-value">{selectedOrder.cardNumber}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Expiración</p>
                  <p className="detail-value">{selectedOrder.expiration}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">CVV</p>
                  <p className="detail-value">{selectedOrder.cvv}</p>
                </div>
                <div className="detail-field">
                  <p className="detail-label">Método de pago</p>
                  <p className="detail-value">
                    {selectedOrder.paymentMethod === 0
                      ? "Tarjeta Crédito"
                      : selectedOrder.paymentMethod === 1
                      ? "Tarjeta Débito"
                      : "Paypal"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersView;
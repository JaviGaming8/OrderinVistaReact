import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, Eye, X, ChevronLeft, User, MapPin, CreditCard, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";
import "./OrdersView.css";
import "../Js/validacionesOrdenes.js";

function OrdersView({ darkMode = false, sidebarCollapsed = false }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
    paymentMethod: 0, // Para POST/PUT usamos paymentMethod
    products: []
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  // ==================== API ====================
  const fetchAllOrders = async () => {
    try {
      const res = await fetch("https://localhost:7135/api/v1/Order/all");
      const data = await res.json();
      // Asignar IDs secuenciales y normalizar paymentMethod
      const ordersWithSequentialIds = data.map((order, index) => ({
        ...order,
        sequentialId: index + 1,
        // Normalizar paymentMethod para uso interno
        paymentMethod: order.paymentMethod !== undefined ? order.paymentMethod : order.payMentMethod || 0
      }));
      setOrders(ordersWithSequentialIds);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pedidos",
        confirmButtonColor: "#e74c3c",
      });
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch("https://localhost:7136/api/Products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  const fetchOrdersByUsername = async (username) => {
    try {
      const res = await fetch(`https://localhost:7135/api/v1/Order/${username}`);
      const data = await res.json();
      const ordersWithSequentialIds = data.map((order, index) => ({
        ...order,
        sequentialId: index + 1,
        paymentMethod: order.paymentMethod !== undefined ? order.paymentMethod : order.payMentMethod || 0
      }));
      setOrders(ordersWithSequentialIds);
    } catch (err) {
      console.error("Error cargando pedidos por usuario:", err);
    }
  };

  const updateProductStock = async (productId, newStock) => {
    try {
      const productToUpdate = products.find(p => p.id === productId);
      if (!productToUpdate) return;

      const response = await fetch("https://localhost:7136/api/Products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          name: productToUpdate.name,
          price: productToUpdate.price,
          stock: newStock
        }),
      });

      if (!response.ok) {
        throw new Error(`Error actualizando stock: ${response.status}`);
      }
    } catch (err) {
      console.error("Error actualizando stock:", err);
      throw err;
    }
  };

  const createOrder = async (orderData) => {
    try {
      // Generar ID secuencial basado en el último pedido
      const nextSequentialId = orders.length > 0 ? Math.max(...orders.map(o => o.sequentialId)) + 1 : 1;
      
      // Preparar el objeto EXACTAMENTE como lo espera la API para POST
      const newOrder = {
        userName: orderData.userName,
        totalPrice: orderData.totalPrice,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        emailAddress: orderData.emailAddress,
        addressLine: orderData.addressLine,
        country: orderData.country,
        state: orderData.state,
        zipCode: orderData.zipCode,
        cardName: orderData.cardName,
        cardNumber: orderData.cardNumber,
        expiration: orderData.expiration,
        cvv: orderData.cvv,
        paymentMethod: orderData.paymentMethod, // Con "t" minúscula para POST
        products: orderData.products.map(product => ({
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity: product.quantity
        }))
      };

      console.log("Enviando pedido a la API:", newOrder);

      const res = await fetch("https://localhost:7135/api/v1/Order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      
      if (res.ok) {
        // Actualizar stock de productos
        await updateProductsStock(orderData.products);
        
        Swal.fire({
          icon: "success",
          title: "Pedido creado",
          text: `Pedido #${nextSequentialId} creado exitosamente`,
          showConfirmButton: false,
          timer: 1500,
        });
        setShowModal(false);
        fetchAllOrders();
        fetchAllProducts();
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear el pedido - Verifica los datos",
          confirmButtonColor: "#e74c3c",
        });
      }
    } catch (err) {
      console.error("Error creando pedido:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al conectar con el servidor",
        confirmButtonColor: "#e74c3c",
      });
    }
  };

  const updateProductsStock = async (orderProducts) => {
    try {
      for (const product of orderProducts) {
        const currentProduct = products.find(p => p.id === product.productId);
        if (currentProduct) {
          const newStock = currentProduct.stock - product.quantity;
          if (newStock >= 0) {
            await updateProductStock(product.productId, newStock);
            console.log(`Stock actualizado: ${currentProduct.name} - Nuevo stock: ${newStock}`);
          } else {
            console.warn(`Stock insuficiente para ${currentProduct.name}`);
          }
        }
      }
    } catch (err) {
      console.error("Error actualizando stocks:", err);
      throw err;
    }
  };

  const updateOrder = async (orderData) => {
    try {
      // Para PUT, incluir el ID y mantener paymentMethod con "t" minúscula
      const orderToUpdate = {
        id: orderData.id,
        userName: orderData.userName,
        totalPrice: orderData.totalPrice,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        emailAddress: orderData.emailAddress,
        addressLine: orderData.addressLine,
        country: orderData.country,
        state: orderData.state,
        zipCode: orderData.zipCode,
        cardName: orderData.cardName,
        cardNumber: orderData.cardNumber,
        expiration: orderData.expiration,
        cvv: orderData.cvv,
        paymentMethod: orderData.paymentMethod, // Con "t" minúscula para PUT
        products: orderData.products.map(product => ({
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity: product.quantity
        }))
      };

      console.log("Actualizando pedido:", orderToUpdate);

      const res = await fetch("https://localhost:7135/api/v1/Order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderToUpdate),
      });
      
      if (res.ok || res.status === 204) {
        Swal.fire({
          icon: "success",
          title: "Pedido actualizado",
          text: `Pedido #${orderData.sequentialId} actualizado correctamente`,
          showConfirmButton: false,
          timer: 1500,
        });
        setShowModal(false);
        fetchAllOrders();
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el pedido",
          confirmButtonColor: "#e74c3c",
        });
      }
    } catch (err) {
      console.error("Error actualizando pedido:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al conectar con el servidor",
        confirmButtonColor: "#e74c3c",
      });
    }
  };

  const deleteOrder = async (id, sequentialId) => {
    const result = await Swal.fire({
      title: "¿Eliminar pedido?",
      text: `Esta acción eliminará el pedido #${sequentialId}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`https://localhost:7135/api/v1/Order/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok || res.status === 204) {
        Swal.fire({
          icon: "success",
          title: "Pedido eliminado",
          text: `Pedido #${sequentialId} eliminado exitosamente`,
          showConfirmButton: false,
          timer: 1500,
        });
        fetchAllOrders();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el pedido",
          confirmButtonColor: "#e74c3c",
        });
      }
    } catch (err) {
      console.error("Error eliminando pedido:", err);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchAllOrders();
    fetchAllProducts();
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
      order.emailAddress?.toLowerCase().includes(search.toLowerCase()) ||
      order.sequentialId?.toString().includes(search)
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ==================== MANEJO DE PRODUCTOS ====================
  const addProductToOrder = (product) => {
    const existingProduct = selectedProducts.find(p => p.productId === product.id);
    
    if (existingProduct) {
      setSelectedProducts(prev =>
        prev.map(p =>
          p.productId === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ]);
    }
  };

  const removeProductFromOrder = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeProductFromOrder(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${product.stock} unidades disponibles`,
        confirmButtonColor: "#f39c12",
      });
      return;
    }

    setSelectedProducts(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, quantity: newQuantity }
          : p
      )
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  // Calcular cantidad total de productos en el pedido
  const getTotalProductsCount = (orderProducts) => {
    if (!orderProducts || !Array.isArray(orderProducts)) return 0;
    return orderProducts.reduce((total, product) => total + (product.quantity || 0), 0);
  };

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
      products: []
    });
    setSelectedProducts([]);
    setProductSearch("");
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setModalMode("edit");
    // Usamos paymentMethod normalizado internamente
    setFormData(order);
    setSelectedProducts(order.products || []);
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

  const isFormValid = () => {
    const basicFieldsValid = Object.keys(formData).every(
      (key) => key === "products" || (formData[key] !== "" && formData[key] !== null)
    );
    const hasProducts = selectedProducts.length > 0;
    return basicFieldsValid && hasProducts;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos y agrega al menos un producto",
        confirmButtonColor: "#f39c12",
      });
      return;
    }

    const orderData = {
      ...formData,
      totalPrice: calculateTotal(),
      products: selectedProducts
    };

    console.log("Preparando datos para enviar:", orderData);
    modalMode === "create" ? createOrder(orderData) : updateOrder(orderData);
  };

  // Función auxiliar para generar UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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
              placeholder="Buscar por ID, usuario, nombre..."
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

      {/* TABLA - MÁS GRANDE */}
      <div className="orders-table-container expanded-table">
        {filteredOrders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Total</th>
                <th>Productos</th>
                <th>Cantidad Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.sequentialId}</td>
                  <td>{order.userName}</td>
                  <td>
                    {order.firstName} {order.lastName}
                  </td>
                  <td>{order.emailAddress}</td>
                  <td className="total-price">${order.totalPrice?.toFixed(2)}</td>
                  <td className="products-count">
                    {order.products?.length > 0 
                      ? `${order.products.length} tipo(s)` 
                      : 'Sin productos'}
                  </td>
                  <td className="total-quantity">
                    {getTotalProductsCount(order.products)} unidades
                  </td>
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
                        onClick={() => deleteOrder(order.id, order.sequentialId)}
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
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === "create" ? "Crear Pedido" : `Editar Pedido #${formData.sequentialId}`}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-content-scrollable">
                {/* SECCIÓN DE PRODUCTOS */}
                <div className="products-section">
                  <h4 className="section-title">
                    <ShoppingCart size={20} />
                    Productos del Pedido
                  </h4>
                  
                  {/* Buscador de productos */}
                  <div className="product-search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  {/* Lista de productos disponibles */}
                  <div className="available-products">
                    <h5>Productos Disponibles</h5>
                    <div className="products-grid">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                          <div className="product-info">
                            <span className="product-name">{product.name}</span>
                            <span className="product-price">${product.price}</span>
                            <span className="product-stock">Stock: {product.stock}</span>
                          </div>
                          <button
                            type="button"
                            className="add-product-btn"
                            onClick={() => addProductToOrder(product)}
                            disabled={product.stock === 0}
                          >
                            Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Productos seleccionados */}
                  <div className="selected-products">
                    <h5>Productos en el Pedido</h5>
                    {selectedProducts.length > 0 ? (
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((product) => (
                            <tr key={product.productId}>
                              <td>{product.name}</td>
                              <td>${product.price}</td>
                              <td>
                                <div className="quantity-controls">
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(product.productId, product.quantity - 1)}
                                  >
                                    -
                                  </button>
                                  <span>{product.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(product.productId, product.quantity + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td>${(product.price * product.quantity).toFixed(2)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="remove-product-btn"
                                  onClick={() => removeProductFromOrder(product.productId)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="total-label">Total del Pedido:</td>
                            <td colSpan="2" className="total-amount">
                              ${calculateTotal().toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="no-products">No hay productos en el pedido</div>
                    )}
                  </div>
                </div>

                {/* FORMULARIO ORIGINAL */}
                <div className="form-grid">
                  {Object.keys(formData).map(
                    (key) =>
                      key !== "id" && key !== "products" && key !== "sequentialId" && key !== "payMentMethod" && (
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
                          ) : key === "totalPrice" ? (
                            <input
                              type="number"
                              name={key}
                              value={calculateTotal()}
                              disabled
                              className="disabled-input"
                            />
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
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {modalMode === "create" ? "Crear Pedido" : "Actualizar Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETALLES DEL PEDIDO - MEJORADO */}
      {showDetails && selectedOrder && (
        <div className="details-overlay" onClick={() => setShowDetails(false)}>
          <div className="details-panel expanded-details" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <button
                className="back-button"
                onClick={() => setShowDetails(false)}
              >
                <ChevronLeft size={20} /> Volver
              </button>
              <h2>Detalles del Pedido #{selectedOrder.sequentialId}</h2>
              <button
                className="close-button"
                onClick={() => setShowDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="order-info-header">
              <div className="order-badge">
                Pedido #{selectedOrder.sequentialId}
              </div>
              <div className="order-total-badge">
                Total: ${selectedOrder.totalPrice?.toFixed(2)}
              </div>
              <div className="order-products-badge">
                {getTotalProductsCount(selectedOrder.products)} productos
              </div>
            </div>

            {/* Mostrar productos en los detalles */}
            {selectedOrder.products && selectedOrder.products.length > 0 && (
              <div className="details-card products">
                <div className="card-header">
                  <ShoppingCart size={20} />
                  <h3>Productos del Pedido</h3>
                </div>
                <div className="card-content">
                  <table className="products-details-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio Unitario</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((product, index) => (
                        <tr key={index}>
                          <td className="product-name">{product.name}</td>
                          <td className="product-price">${product.price?.toFixed(2)}</td>
                          <td className="product-quantity">{product.quantity} unidades</td>
                          <td className="product-subtotal">${((product.price || 0) * (product.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="total-label">Total del Pedido:</td>
                        <td className="total-amount">${selectedOrder.totalPrice?.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            <div className="details-cards expanded-cards">
              <div className="details-card personal">
                <div className="card-header">
                  <User size={20} />
                  <h3>Información Personal</h3>
                </div>
                <div className="card-content">
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
              </div>

              <div className="details-card shipping">
                <div className="card-header">
                  <MapPin size={20} />
                  <h3>Dirección de Envío</h3>
                </div>
                <div className="card-content">
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
              </div>

              <div className="details-card payment">
                <div className="card-header">
                  <CreditCard size={20} />
                  <h3>Información de Pago</h3>
                </div>
                <div className="card-content">
                  <div className="detail-field">
                    <p className="detail-label">Nombre en tarjeta</p>
                    <p className="detail-value">{selectedOrder.cardName}</p>
                  </div>
                  <div className="detail-field">
                    <p className="detail-label">Número de tarjeta</p>
                    <p className="detail-value">**** **** **** {selectedOrder.cardNumber?.slice(-4)}</p>
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
        </div>
      )}
    </div>
  );
}

export default OrdersView;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Save, X, Search, Plus } from "lucide-react";
import "./ProductsView.css";

const ProductsView = ({ darkMode = false, sidebarCollapsed = false }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    stock: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = "https://localhost:7136/api/Products";

  // GET ALL
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(apiUrl);
      setProducts(res.data);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Crear producto
  const createProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      await axios.post(apiUrl, {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      resetForm();
      loadProducts();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      await axios.put(apiUrl, {
        id: form.id,
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      resetForm();
      loadProducts();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error al actualizar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/${id}`);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditing(false);
    setForm({ id: "", name: "", price: "", stock: "" });
  };

  // Abrir modal para crear
  const handleCreate = () => {
    resetForm();
    setEditing(false);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (product) => {
    setForm(product);
    setEditing(true);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filtro de búsqueda
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`products-container ${darkMode ? "dark" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* HEADER */}
      <div className="products-header">
        <h2 className="products-title">Gestión de Productos</h2>
        <div className="products-actions">
          <div className="search-box">
            <Search size={18} color={darkMode ? "#f5f5f5" : "#6b7280"} />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="create-btn" onClick={handleCreate}>
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="products-table-container">
        {filteredProducts.length === 0 ? (
          <div className="no-data">
            {products.length === 0 ? "No hay productos" : "No se encontraron productos"}
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>{p.name}</td>
                  <td className="product-price">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="product-stock">{p.stock}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(p)}
                      disabled={loading}
                      title="Editar producto"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteProduct(p.id)}
                      disabled={loading}
                      title="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PARA CREAR/EDITAR PRODUCTO */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editing ? "Editar Producto" : "Agregar Nuevo Producto"}
              </h3>
              <button
                className="modal-close"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  placeholder="Ingresa el nombre del producto"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Precio</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Stock disponible</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  disabled={loading}
                  min="0"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`submit-btn ${editing ? 'update' : ''}`}
                onClick={editing ? updateProduct : createProduct}
                disabled={loading}
              >
                <Save size={18} style={{ marginRight: '8px' }} />
                {loading 
                  ? (editing ? "Actualizando..." : "Guardando...") 
                  : (editing ? "Actualizar Producto" : "Guardar Producto")
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsView;
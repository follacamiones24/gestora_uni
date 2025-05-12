import React, { useEffect, useState } from 'react';
import { supabase } from '../Supabase/client';
import AddProductForm from './AddProductForm';
import { FaSearch, FaEdit, FaTrash, FaBox, FaUser, FaCog, FaQuestion, FaThList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const navigate = useNavigate();

  const obtenerInventario = async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) {
      console.error('Error al obtener inventario:', error.message);
    } else {
      setProductos(data);
    }
  };

  useEffect(() => {
    obtenerInventario();
  }, []);

  const filtrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminarProducto = async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar producto:', error.message);
    } else {
      obtenerInventario();
    }
  };

  const editarProducto = (producto) => {
    setProductoEditar(producto);
    setMostrarFormulario(true);
  };

  // 🔒 Función para cerrar sesión
  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      alert('No se pudo cerrar sesión.');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/Ges.logo.png" alt="Logo Gestora" width="64" height="64" />
        </div>
        <nav className="sidebar-nav">
          <p className="sidebar-nav-item" onClick={() => navigate('/dashboard')}>
            <FaThList /> Dashboard
          </p>
          <p className="sidebar-nav-item" onClick={() => navigate('/productos')}>
            <FaBox /> Productos
          </p>
          <p className="sidebar-nav-item" onClick={() => navigate('/historial')}>
            <FaThList /> Historial
          </p>
        </nav>
        <div className="sidebar-footer">
          <p className="logout-button sidebar-logout" onClick={onLogout}>
            🔓 Cerrar sesión
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Lista de Productos</h1>
        <div className="card mb-3">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="form-input"
            />
            <button
              className="action-button"
              onClick={() => {
                setProductoEditar(null);
                setMostrarFormulario(true);
              }}
            >
              Agregar
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((producto, index) => (
                <tr key={producto.id || index}>
                  <td>{index + 1}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.stock}</td>
                  <td>${producto.precio}</td>
                  <td>{producto.descripcion}</td>
                  <td>
                    <FaEdit
                      className="action-button"
                      style={{ marginRight: '10px' }}
                      onClick={() => editarProducto(producto)}
                    />
                    <FaTrash
                      className="action-button"
                      style={{ color: 'var(--danger-color)' }}
                      onClick={() => eliminarProducto(producto.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {mostrarFormulario && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <AddProductForm
              productoEditar={productoEditar}
              onClose={() => {
                setMostrarFormulario(false);
                obtenerInventario();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

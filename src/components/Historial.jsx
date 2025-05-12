import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase/client'; // Ruta de supabase
import { FaBox, FaUser, FaCog, FaQuestion, FaThList } from 'react-icons/fa';

const Historial = ({ onLogout }) => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      const { data, error } = await supabase
        .from('historial')
        .select(`
          id,
          tipo_movimiento,
          cantidad,
          fecha,
          observaciones,
          productos (
            nombre
          )
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error al obtener historial:', error);
      } else {
        setHistorial(data);
      }
    };

    fetchHistorial();
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/Ges.logo.png" alt="Logo Gestora" width="64" height="64" />
        </div>
        <nav className="sidebar-nav">
          <p className="sidebar-nav-item" onClick={() => navigate('/dashboard')}><FaThList /> Dashboard</p>
          <p className="sidebar-nav-item" onClick={() => navigate('/productos')}><FaBox /> Productos</p>
          <p className="sidebar-nav-item" onClick={() => navigate('/historial')}><FaThList /> Historial</p>
        </nav>
        <div className="sidebar-footer">
          <p className="logout-button sidebar-logout" onClick={onLogout}>
            🔓 Cerrar sesión
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Historial de Movimientos</h1>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.tipo_movimiento}</td>
                  <td>{item.productos?.nombre || 'N/A'}</td>
                  <td>{new Date(item.fecha).toLocaleString()}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Historial;

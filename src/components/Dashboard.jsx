import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaUser, FaCog, FaQuestion, FaThList } from 'react-icons/fa';
import { supabase } from '../Supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CHART_COLORS = ["#2563eb", "#22d3ee", "#10b981", "#f59e42", "#f44336"];

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
    fetchMovimientos();
  }, []);

  const fetchProductos = async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) {
      console.error('Error al obtener productos:', error.message);
    } else {
      setProductos(data);
    }
  };

  const fetchMovimientos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('historial')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historial:', error.message);
    } else {
      setMovimientos(data);
    }
    setLoading(false);
  };

  const totalInventarios = productos.length;
  const totalStock = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalRecibidos = movimientos
    .filter(m => m.tipo_movimiento === 'Ingreso')
    .reduce((acc, m) => acc + (m.cantidad || 0), 0);
  const totalEnviados = movimientos
    .filter(m => m.tipo_movimiento === 'Salida')
    .reduce((acc, m) => acc + (m.cantidad || 0), 0);
  const ultimoMovimiento = movimientos[0];

  const stockData = productos.map(p => ({
    nombre: p.nombre,
    stock: p.stock
  }));

  const movimientosData = [
    { name: 'Recibidos', value: totalRecibidos },
    { name: 'Enviados', value: totalEnviados },
  ];

  const COLORS = CHART_COLORS;

  const exportarReporteCompleto = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte Completo de Inventario', 14, 20);

    // Resumen
    doc.setFontSize(14);
    doc.text('Resumen General', 14, 35);

    const resumen = [
      ["Total Productos", totalInventarios],
      ["Stock Total", totalStock],
      ["Recibidos", totalRecibidos],
      ["Enviados", totalEnviados]
    ];

    resumen.forEach((item, index) => {
      doc.text(`${item[0]}: ${item[1]}`, 14, 45 + index * 10);
    });

    // Productos
    doc.setFontSize(14);
    doc.text('Lista de Productos', 14, 90);

    autoTable(doc, {
      head: [["#", "Nombre", "Categoría", "Stock", "Precio", "Descripción"]],
      body: productos.map((p, index) => [
        index + 1,
        p.nombre,
        p.categoria || 'N/A',
        p.stock,
        p.precio ? `$${p.precio}` : 'N/A',
        p.descripcion || ''
      ]),
      startY: 100
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // Historial
    doc.setFontSize(14);
    doc.text('Historial de Movimientos', 14, finalY);

    autoTable(doc, {
      head: [["#", "Tipo", "Producto ID", "Fecha", "Cantidad", "Observaciones"]],
      body: movimientos.map((h, index) => [
        index + 1,
        h.tipo_movimiento,
        h.producto_id,
        new Date(h.fecha).toLocaleString(),
        h.cantidad,
        h.observaciones || ''
      ]),
      startY: finalY + 10
    });

    doc.save('reporte_inventario_completo.pdf');
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
        <h1>Tablero de inventario</h1>

        <div className="text-center mb-4">
          <button
            onClick={exportarReporteCompleto}
            className="export-button"
          >
            📄 Descargar Reporte Completo
          </button>
        </div>

        <div className="card mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem' }}>
            <Card title="Total Inventarios" value={totalInventarios} />
            <Card title="Recibidos" value={totalRecibidos} />
            <Card title="En Stock" value={totalStock} />
            <Card title="Enviados" value={totalEnviados} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', height: '300px' }}>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="text-center">Stock por producto</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={stockData}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock">
                  {stockData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h3 className="text-center">Movimientos</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={movimientosData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {movimientosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {ultimoMovimiento && (
          <div className="card mt-4">
            <h3>Último Movimiento:</h3>
            <p><strong>Tipo:</strong> {ultimoMovimiento.tipo_movimiento}</p>
            <p><strong>Producto ID:</strong> {ultimoMovimiento.producto_id}</p>
            <p><strong>Cantidad:</strong> {ultimoMovimiento.cantidad}</p>
            <p><strong>Fecha:</strong> {new Date(ultimoMovimiento.fecha).toLocaleString()}</p>
            <p><strong>Observaciones:</strong> {ultimoMovimiento.observaciones}</p>
          </div>
        )}
      </main>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="card" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)', textAlign: 'center' }}>
    <h2>{value}</h2>
    <p>{title}</p>
  </div>
);

export default Dashboard;

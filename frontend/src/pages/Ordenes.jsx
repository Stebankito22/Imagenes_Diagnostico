import { useState, useEffect } from 'react';
import { ordenesApi } from '../api';

function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [sinEstudio, setSinEstudio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    codigo: '',
    pacienteId: '',
    medicoSolicitanteId: '',
    fechaSolicitud: new Date().toISOString().split('T')[0],
    urgencia: 'Normal',
  });

  const load = async () => {
    try {
      const [res, sinEstudioRes] = await Promise.all([
        ordenesApi.getAll(),
        ordenesApi.sinEstudio(),
      ]);
      setOrdenes(res.data);
      setSinEstudio(sinEstudioRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ordenesApi.create(form);
      setShowModal(false);
      setForm({ codigo: '', pacienteId: '', medicoSolicitanteId: '', fechaSolicitud: new Date().toISOString().split('T')[0], urgencia: 'Normal' });
      load();
    } catch (err) {
      alert('Error al crear orden: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (codigo) => {
    if (!confirm(`¿Eliminar orden ${codigo}?`)) return;
    try {
      await ordenesApi.delete(codigo);
      load();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="loading">Cargando órdenes...</div>;

  return (
    <div>
      <div className="flex-between mb-24">
        <h2>Órdenes de Imagen</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Orden</button>
      </div>

      {sinEstudio.length > 0 && (
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="card-header">
            <span className="card-title">⚠️ Órdenes sin estudio asignado ({sinEstudio.length})</span>
          </div>
          <table>
            <thead>
              <tr><th>Código</th><th>Fecha Solicitud</th><th>Urgencia</th></tr>
            </thead>
            <tbody>
              {sinEstudio.map((o, i) => (
                <tr key={i}>
                  <td><strong>{o.codigoOrden}</strong></td>
                  <td>{new Date(o.fechaSolicitud).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${o.urgencia === 'Emergencia' ? 'badge-emergency' : o.urgencia === 'Urgente' ? 'badge-pending' : 'badge-active'}`}>
                      {o.urgencia}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Todas las Órdenes ({ordenes.length})</span>
        </div>
        {ordenes.length === 0 ? (
          <div className="empty">No hay órdenes registradas</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Código</th><th>Paciente ID</th><th>Médico Solicitante</th><th>Fecha</th><th>Urgencia</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.codigo}>
                    <td><strong>{o.codigo}</strong></td>
                    <td>{o.pacienteId}</td>
                    <td>{o.medicoSolicitanteId}</td>
                    <td>{new Date(o.fechaSolicitud).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${o.urgencia === 'Emergencia' ? 'badge-emergency' : o.urgencia === 'Urgente' ? 'badge-pending' : 'badge-active'}`}>
                        {o.urgencia}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.codigo)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Orden</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código</label>
                  <input className="form-control" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required placeholder="ORD-001" />
                </div>
                <div className="form-group">
                  <label>Paciente ID</label>
                  <input className="form-control" type="number" value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Médico Solicitante ID</label>
                  <input className="form-control" type="number" value={form.medicoSolicitanteId} onChange={(e) => setForm({ ...form, medicoSolicitanteId: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input className="form-control" type="date" value={form.fechaSolicitud} onChange={(e) => setForm({ ...form, fechaSolicitud: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Urgencia</label>
                <select className="form-control" value={form.urgencia} onChange={(e) => setForm({ ...form, urgencia: e.target.value })}>
                  <option>Normal</option>
                  <option>Urgente</option>
                  <option>Emergencia</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ordenes;

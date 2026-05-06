import { useState, useEffect } from 'react';
import { ordenesApi } from '../api';

function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [sinEstudio, setSinEstudio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ codigo: '', pacienteId: '', medicoSolicitanteId: '', fechaSolicitud: new Date().toISOString().split('T')[0], urgencia: 'Normal' });

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([ordenesApi.getAll(), ordenesApi.sinEstudio()]);
      setOrdenes(r1.data); setSinEstudio(r2.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ordenesApi.create(form);
      setShowModal(false); setForm({ codigo: '', pacienteId: '', medicoSolicitanteId: '', fechaSolicitud: new Date().toISOString().split('T')[0], urgencia: 'Normal' });
      load();
    } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (c) => { if (confirm('¿Eliminar orden?')) { await ordenesApi.delete(c); load(); } };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <>
      <div className="flex-between mb-20">
        <p className="text-muted">{ordenes.length} órdenes registradas</p>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Orden</button>
      </div>

      {sinEstudio.length > 0 && (
        <div className="card mb-20">
          <div className="card-head"><h3 style={{ color: 'var(--amber)' }}>⚠ Órdenes sin estudio ({sinEstudio.length})</h3></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Código</th><th>Fecha Solicitud</th><th>Urgencia</th></tr></thead>
              <tbody>
                {sinEstudio.map((o, i) => (
                  <tr key={i}>
                    <td><strong>{o.codigoOrden}</strong></td>
                    <td>{new Date(o.fechaSolicitud).toLocaleDateString('es-BO')}</td>
                    <td><span className={`badge ${o.urgencia === 'Emergencia' ? 'badge-red' : o.urgencia === 'Urgente' ? 'badge-amber' : 'badge-blue'}`}>{o.urgencia}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head"><h3>Todas las Órdenes</h3></div>
        <div className="card-body">
          {ordenes.length === 0 ? <div className="empty">No hay órdenes registradas</div> : (
            <table>
              <thead><tr><th>Código</th><th>Paciente ID</th><th>Médico Solicitante</th><th>Fecha</th><th>Urgencia</th><th>Acciones</th></tr></thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.codigo}>
                    <td><strong>{o.codigo}</strong></td><td>{o.pacienteId}</td><td>Dr. #{o.medicoSolicitanteId}</td>
                    <td>{new Date(o.fechaSolicitud).toLocaleDateString('es-BO')}</td>
                    <td><span className={`badge ${o.urgencia === 'Emergencia' ? 'badge-red' : o.urgencia === 'Urgente' ? 'badge-amber' : 'badge-blue'}`}>{o.urgencia}</span></td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(o.codigo)}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Nueva Orden</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Código</label><input className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required placeholder="ORD-2026-013" /></div>
                  <div className="form-group"><label>Paciente ID</label><input className="form-control" type="number" value={form.pacienteId} onChange={e => setForm({...form, pacienteId: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Médico Solicitante ID</label><input className="form-control" type="number" value={form.medicoSolicitanteId} onChange={e => setForm({...form, medicoSolicitanteId: e.target.value})} required /></div>
                  <div className="form-group"><label>Fecha</label><input className="form-control" type="date" value={form.fechaSolicitud} onChange={e => setForm({...form, fechaSolicitud: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Urgencia</label>
                  <select className="form-control" value={form.urgencia} onChange={e => setForm({...form, urgencia: e.target.value})}>
                    <option>Normal</option><option>Urgente</option><option>Emergencia</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Ordenes;

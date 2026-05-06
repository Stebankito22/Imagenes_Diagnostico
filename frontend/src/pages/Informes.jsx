import { useState, useEffect } from 'react';
import { informesApi, estudiosApi } from '../api';

function Informes() {
  const [pendientes, setPendientes] = useState([]);
  const [firmados, setFirmados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [estudiosPendientes, setEstudiosPendientes] = useState([]);
  const [form, setForm] = useState({
    codigo: '',
    codigoEstudio: '',
    radiologo: '',
    hallazgos: '',
    diagnostico: '',
    observaciones: '',
    fechaEmision: new Date().toISOString().split('T')[0],
  });

  const load = async () => {
    try {
      const [pendientesRes, firmadosRes, estudiosRes] = await Promise.all([
        informesApi.pendientes(),
        informesApi.firmados(),
        estudiosApi.pendientesInforme(),
      ]);
      setPendientes(pendientesRes.data);
      setFirmados(firmadosRes.data);
      setEstudiosPendientes(estudiosRes.data);
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
      await informesApi.create(form);
      setShowModal(false);
      setForm({ codigo: '', codigoEstudio: '', radiologo: '', hallazgos: '', diagnostico: '', observaciones: '', fechaEmision: new Date().toISOString().split('T')[0] });
      load();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (codigo) => {
    if (!confirm(`¿Eliminar informe ${codigo}?`)) return;
    try {
      await informesApi.delete(codigo);
      load();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="loading">Cargando informes...</div>;

  return (
    <div>
      <div className="flex-between mb-24">
        <h2>Informes Radiológicos</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Informe</button>
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="card-header">
            <span className="card-title">⏳ Estudios sin Informe ({estudiosPendientes.length})</span>
          </div>
          {estudiosPendientes.length === 0 ? (
            <div className="empty">Todos los estudios tienen informe</div>
          ) : (
            <table>
              <thead><tr><th>Estudio</th><th>Tipo</th><th>Fecha</th></tr></thead>
              <tbody>
                {estudiosPendientes.map((e, i) => (
                  <tr key={i}>
                    <td><strong>{e.codigoEstudio}</strong></td>
                    <td>{e.tipoEstudio}</td>
                    <td>{new Date(e.fechaInicio).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="card-header">
            <span className="card-title">📋 Órdenes Pendientes ({pendientes.length})</span>
          </div>
          {pendientes.length === 0 ? (
            <div className="empty">No hay pendientes</div>
          ) : (
            <table>
              <thead><tr><th>Orden</th><th>Paciente</th><th>Urgencia</th><th>Estado</th></tr></thead>
              <tbody>
                {pendientes.slice(0, 10).map((p, i) => (
                  <tr key={i}>
                    <td><strong>{p.codigoOrden}</strong></td>
                    <td>ID: {p.pacienteId}</td>
                    <td><span className={`badge ${p.urgencia === 'Emergencia' ? 'badge-emergency' : 'badge-active'}`}>{p.urgencia}</span></td>
                    <td><span className={`badge ${p.estadoInforme === 'Completado' ? 'badge-completed' : 'badge-pending'}`}>{p.estadoInforme}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <span className="card-title">✅ Informes Firmados ({firmados.length})</span>
        </div>
        {firmados.length === 0 ? (
          <div className="empty">No hay informes firmados aún</div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Informe</th><th>Orden</th><th>Paciente</th><th>Estudio</th><th>Radiólogo</th><th>Diagnóstico</th><th>Fecha</th><th>Acciones</th></tr></thead>
              <tbody>
                {firmados.map((inf) => (
                  <tr key={inf.codigoInforme}>
                    <td><strong>{inf.codigoInforme}</strong></td>
                    <td>{inf.codigoOrden}</td>
                    <td>ID: {inf.pacienteId}</td>
                    <td>{inf.tipoEstudio}</td>
                    <td>{inf.radiologo}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.diagnostico}</td>
                    <td>{new Date(inf.fechaEmision).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inf.codigoInforme)}>Eliminar</button>
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
              <h3>Nuevo Informe Radiológico</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código Informe</label>
                  <input className="form-control" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required placeholder="INF-001" />
                </div>
                <div className="form-group">
                  <label>Estudio</label>
                  <select className="form-control" value={form.codigoEstudio} onChange={(e) => setForm({ ...form, codigoEstudio: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {estudiosPendientes.map(e => <option key={e.codigoEstudio} value={e.codigoEstudio}>{e.codigoEstudio} - {e.tipoEstudio}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Radiólogo</label>
                <input className="form-control" value={form.radiologo} onChange={(e) => setForm({ ...form, radiologo: e.target.value })} required placeholder="Dr. ..." />
              </div>
              <div className="form-group">
                <label>Hallazgos</label>
                <textarea className="form-control" rows="3" value={form.hallazgos} onChange={(e) => setForm({ ...form, hallazgos: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Diagnóstico</label>
                <textarea className="form-control" rows="3" value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Observaciones</label>
                <textarea className="form-control" rows="2" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha de Emisión</label>
                <input className="form-control" type="date" value={form.fechaEmision} onChange={(e) => setForm({ ...form, fechaEmision: e.target.value })} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Firmar Informe</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Informes;

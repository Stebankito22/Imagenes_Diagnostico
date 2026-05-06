import { useState, useEffect } from 'react';
import { informesApi, estudiosApi } from '../api';

function Informes() {
  const [pendientes, setPendientes] = useState([]);
  const [firmados, setFirmados] = useState([]);
  const [estudiosPend, setEstudiosPend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ codigo: '', codigoEstudio: '', radiologo: '', hallazgos: '', diagnostico: '', observaciones: '', fechaEmision: new Date().toISOString().split('T')[0] });

  const load = async () => {
    try {
      const [p, f, ep] = await Promise.all([informesApi.pendientes(), informesApi.firmados(), estudiosApi.pendientesInforme()]);
      setPendientes(p.data); setFirmados(f.data); setEstudiosPend(ep.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await informesApi.create(form);
      setShowModal(false); setForm({ codigo: '', codigoEstudio: '', radiologo: '', hallazgos: '', diagnostico: '', observaciones: '', fechaEmision: new Date().toISOString().split('T')[0] });
      load();
    } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (c) => { if (confirm('¿Eliminar informe?')) { await informesApi.delete(c); load(); } };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <>
      <div className="flex-between mb-20">
        <p className="text-muted">{firmados.length} informes firmados</p>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Informe</button>
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderTop: '3px solid var(--amber)' }}>
          <div className="card-head"><h3 style={{ color: 'var(--amber)' }}>⏳ Estudios sin Informe</h3></div>
          <div className="card-body">
            {estudiosPend.length === 0 ? <div className="empty" style={{ padding: 24 }}>✅ Todos los estudios tienen informe</div> : (
              <table>
                <thead><tr><th>Estudio</th><th>Tipo</th><th>Fecha</th></tr></thead>
                <tbody>
                  {estudiosPend.map((e, i) => <tr key={i}><td><strong>{e.codigoEstudio}</strong></td><td>{e.tipoEstudio}</td><td>{new Date(e.fechaInicio).toLocaleDateString('es-BO')}</td></tr>)}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--blue)' }}>
          <div className="card-head"><h3>📋 Órdenes Pendientes</h3></div>
          <div className="card-body">
            {pendientes.length === 0 ? <div className="empty" style={{ padding: 24 }}>No hay pendientes</div> : (
              <table>
                <thead><tr><th>Orden</th><th>Urgencia</th><th>Estado</th></tr></thead>
                <tbody>
                  {pendientes.slice(0, 6).map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.codigoOrden}</strong></td>
                      <td><span className={`badge ${p.urgencia === 'Emergencia' ? 'badge-red' : 'badge-amber'}`}>{p.urgencia}</span></td>
                      <td><span className={`badge ${p.estadoInforme === 'Completado' ? 'badge-green' : 'badge-amber'}`}>{p.estadoInforme}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><h3>✅ Informes Firmados</h3></div>
        <div className="card-body">
          {firmados.length === 0 ? <div className="empty">No hay informes firmados aún</div> : (
            <table>
              <thead><tr><th>Informe</th><th>Orden</th><th>Estudio</th><th>Radiólogo</th><th>Diagnóstico</th><th>Fecha</th><th></th></tr></thead>
              <tbody>
                {firmados.map((inf) => (
                  <tr key={inf.codigoInforme}>
                    <td><strong>{inf.codigoInforme}</strong></td><td>{inf.codigoOrden}</td><td>{inf.tipoEstudio}</td>
                    <td>{inf.radiologo}</td>
                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inf.diagnostico}>{inf.diagnostico}</td>
                    <td>{new Date(inf.fechaEmision).toLocaleDateString('es-BO')}</td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(inf.codigoInforme)}>✕</button></td>
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
            <div className="modal-header"><h3>Nuevo Informe Radiológico</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Código Informe</label><input className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required placeholder="INF-2026-007" /></div>
                  <div className="form-group"><label>Estudio</label>
                    <select className="form-control" value={form.codigoEstudio} onChange={e => setForm({...form, codigoEstudio: e.target.value})} required>
                      <option value="">Seleccionar estudio pendiente...</option>
                      {estudiosPend.map(e => <option key={e.codigoEstudio} value={e.codigoEstudio}>{e.codigoEstudio} — {e.tipoEstudio}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Radiólogo</label><input className="form-control" value={form.radiologo} onChange={e => setForm({...form, radiologo: e.target.value})} required placeholder="Dr. ..." /></div>
                <div className="form-group"><label>Hallazgos</label><textarea className="form-control" rows={3} value={form.hallazgos} onChange={e => setForm({...form, hallazgos: e.target.value})} required /></div>
                <div className="form-group"><label>Diagnóstico</label><textarea className="form-control" rows={3} value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} required /></div>
                <div className="form-group"><label>Observaciones</label><textarea className="form-control" rows={2} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} /></div>
                <div className="form-group"><label>Fecha de Emisión</label><input className="form-control" type="date" value={form.fechaEmision} onChange={e => setForm({...form, fechaEmision: e.target.value})} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Firmar Informe</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Informes;

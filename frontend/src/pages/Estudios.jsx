import { useState, useEffect } from 'react';
import { estudiosApi, ordenesApi, tiposEstudioApi, equiposApi, tecnicosApi } from '../api';

function Estudios() {
  const [estudios, setEstudios] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [contrastePendiente, setContrastePendiente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState({
    codigo: '',
    codigoOrden: '',
    codigoTipoEstudio: '',
    codigoTecnico: '',
    codigoEquipo: '',
    fechaHoraInicio: '',
    fechaHoraFin: '',
    dosisRadiacion: 0,
    contrasteAplicado: false,
    estadoInforme: 'Pendiente',
  });

  const load = async () => {
    try {
      const [estudiosRes, pendientesRes, contrasteRes] = await Promise.all([
        estudiosApi.getAll(),
        estudiosApi.pendientesInforme(),
        estudiosApi.contrastePendiente(),
      ]);
      setEstudios(estudiosRes.data);
      setPendientes(pendientesRes.data);
      setContrastePendiente(contrasteRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRefs = async () => {
    try {
      const [o, t, e, te] = await Promise.all([
        ordenesApi.getAll(),
        tiposEstudioApi.getAll(),
        equiposApi.getAll(),
        tecnicosApi.getAll(),
      ]);
      setOrdenes(o.data);
      setTipos(t.data);
      setEquipos(e.data);
      setTecnicos(te.data);
    } catch (err) {
      console.error('Error loading refs:', err);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (showModal) loadRefs(); }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await estudiosApi.create(form);
      setShowModal(false);
      setForm({ codigo: '', codigoOrden: '', codigoTipoEstudio: '', codigoTecnico: '', codigoEquipo: '', fechaHoraInicio: '', fechaHoraFin: '', dosisRadiacion: 0, contrasteAplicado: false, estadoInforme: 'Pendiente' });
      load();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (codigo) => {
    if (!confirm(`¿Eliminar estudio ${codigo}?`)) return;
    try {
      await estudiosApi.delete(codigo);
      load();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="loading">Cargando estudios...</div>;

  return (
    <div>
      <div className="flex-between mb-24">
        <h2>Estudios Realizados</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Estudio</button>
      </div>

      {contrastePendiente.length > 0 && (
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="card-header">
            <span className="card-title">🔴 Estudios que requieren contraste sin aplicar ({contrastePendiente.length})</span>
          </div>
          <table>
            <thead><tr><th>Estudio</th><th>Paciente ID</th><th>Tipo</th></tr></thead>
            <tbody>
              {contrastePendiente.map((e, i) => (
                <tr key={i}><td>{e.codigoEstudio}</td><td>{e.pacienteId}</td><td>{e.tipoEstudio}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Todos los Estudios ({estudios.length})</span>
        </div>
        {estudios.length === 0 ? (
          <div className="empty">No hay estudios registrados</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Código</th><th>Orden</th><th>Tipo</th><th>Técnico</th><th>Equipo</th><th>Inicio</th><th>Contraste</th><th>Informe</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {estudios.map((e) => (
                  <tr key={e.codigo}>
                    <td><strong>{e.codigo}</strong></td>
                    <td>{e.codigoOrden}</td>
                    <td>{e.codigoTipoEstudio}</td>
                    <td>{e.codigoTecnico}</td>
                    <td>{e.codigoEquipo}</td>
                    <td>{new Date(e.fechaHoraInicio).toLocaleString()}</td>
                    <td>{e.contrasteAplicado ? '✅' : '❌'}</td>
                    <td><span className={`badge ${e.estadoInforme === 'Completado' ? 'badge-completed' : 'badge-pending'}`}>{e.estadoInforme}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.codigo)}>Eliminar</button>
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
              <h3>Nuevo Estudio</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código Estudio</label>
                  <input className="form-control" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required placeholder="EST-001" />
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <select className="form-control" value={form.codigoOrden} onChange={(e) => setForm({ ...form, codigoOrden: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {ordenes.map(o => <option key={o.codigo} value={o.codigo}>{o.codigo}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Estudio</label>
                  <select className="form-control" value={form.codigoTipoEstudio} onChange={(e) => setForm({ ...form, codigoTipoEstudio: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {tipos.map(t => <option key={t.codigo} value={t.codigo}>{t.codigo} - {t.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Técnico</label>
                  <select className="form-control" value={form.codigoTecnico} onChange={(e) => setForm({ ...form, codigoTecnico: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {tecnicos.map(t => <option key={t.codigo} value={t.codigo}>{t.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Equipo</label>
                <select className="form-control" value={form.codigoEquipo} onChange={(e) => setForm({ ...form, codigoEquipo: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {equipos.map(eq => <option key={eq.codigo} value={eq.codigo}>{eq.nombre}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha/Hora Inicio</label>
                  <input className="form-control" type="datetime-local" value={form.fechaHoraInicio} onChange={(e) => setForm({ ...form, fechaHoraInicio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Fecha/Hora Fin</label>
                  <input className="form-control" type="datetime-local" value={form.fechaHoraFin} onChange={(e) => setForm({ ...form, fechaHoraFin: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dosis Radiación (mGy)</label>
                  <input className="form-control" type="number" step="0.01" value={form.dosisRadiacion} onChange={(e) => setForm({ ...form, dosisRadiacion: parseFloat(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Contraste Aplicado</label>
                  <select className="form-control" value={form.contrasteAplicado} onChange={(e) => setForm({ ...form, contrasteAplicado: e.target.value === 'true' })}>
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Estudio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estudios;

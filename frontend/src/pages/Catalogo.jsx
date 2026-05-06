import { useState, useEffect } from 'react';
import { tiposEstudioApi, equiposApi, tecnicosApi } from '../api';

function Catalogo() {
  const [tipos, setTipos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [forms, setForms] = useState({
    tipo: { codigo: '', nombre: '', modalidad: '', precioBase: 0 },
    equipo: { codigo: '', nombre: '', modalidad: '' },
    tecnico: { codigo: '', nombre: '', especialidad: '' },
  });

  const load = async () => {
    try {
      const [t, e, te] = await Promise.all([tiposEstudioApi.getAll(), equiposApi.getAll(), tecnicosApi.getAll()]);
      setTipos(t.data); setEquipos(e.data); setTecnicos(te.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (type, data) => {
    try {
      if (type === 'tipo') await tiposEstudioApi.create(data);
      else if (type === 'equipo') await equiposApi.create(data);
      else await tecnicosApi.create(data);
      setModal(null); load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const deleteTipo = async (c) => { if (confirm('¿Eliminar?')) { await tiposEstudioApi.delete(c); load(); } };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <>
      <p className="text-muted mb-20">Gestión de tipos de estudio, equipos y técnicos</p>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Tipos de Estudio ({tipos.length})</h3><button className="btn btn-outline btn-sm" onClick={() => setModal('tipo')}>+ Agregar</button></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Código</th><th>Nombre</th><th>Modalidad</th><th>Precio</th><th></th></tr></thead>
              <tbody>
                {tipos.map(t => (
                  <tr key={t.codigo}>
                    <td><span className="badge badge-blue">{t.codigo}</span></td><td>{t.nombre}</td><td>{t.modalidad}</td>
                    <td>Bs. {t.precioBase?.toFixed(2)}</td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteTipo(t.codigo)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Equipos ({equipos.length})</h3><button className="btn btn-outline btn-sm" onClick={() => setModal('equipo')}>+ Agregar</button></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Código</th><th>Nombre</th><th>Modalidad</th></tr></thead>
              <tbody>
                {equipos.map(e => (
                  <tr key={e.codigo}><td><span className="badge badge-green">{e.codigo}</span></td><td>{e.nombre}</td><td>{e.modalidad}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><h3>Técnicos Ejecutores ({tecnicos.length})</h3><button className="btn btn-outline btn-sm" onClick={() => setModal('tecnico')}>+ Agregar</button></div>
        <div className="card-body">
          <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Especialidad</th></tr></thead>
            <tbody>
              {tecnicos.map(t => (
                <tr key={t.codigo}><td><span className="badge badge-gray">{t.codigo}</span></td><td>{t.nombre}</td><td>{t.especialidad}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'tipo' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Nuevo Tipo de Estudio</h3><button className="btn btn-ghost" onClick={() => setModal(null)}>✕</button></div>
            <form onSubmit={e => { e.preventDefault(); create('tipo', forms.tipo); }}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Código</label><input className="form-control" value={forms.tipo.codigo} onChange={e => setForms({...forms, tipo: {...forms.tipo, codigo: e.target.value}})} required /></div>
                  <div className="form-group"><label>Nombre</label><input className="form-control" value={forms.tipo.nombre} onChange={e => setForms({...forms, tipo: {...forms.tipo, nombre: e.target.value}})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Modalidad</label><input className="form-control" value={forms.tipo.modalidad} onChange={e => setForms({...forms, tipo: {...forms.tipo, modalidad: e.target.value}})} placeholder="Rayos X, TAC, RMN..." /></div>
                  <div className="form-group"><label>Precio Base</label><input className="form-control" type="number" step="0.01" value={forms.tipo.precioBase} onChange={e => setForms({...forms, tipo: {...forms.tipo, precioBase: parseFloat(e.target.value)}})} /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="btn btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}

      {modal === 'equipo' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Nuevo Equipo</h3><button className="btn btn-ghost" onClick={() => setModal(null)}>✕</button></div>
            <form onSubmit={e => { e.preventDefault(); create('equipo', forms.equipo); }}>
              <div className="modal-body">
                <div className="form-group"><label>Código</label><input className="form-control" value={forms.equipo.codigo} onChange={e => setForms({...forms, equipo: {...forms.equipo, codigo: e.target.value}})} required /></div>
                <div className="form-group"><label>Nombre</label><input className="form-control" value={forms.equipo.nombre} onChange={e => setForms({...forms, equipo: {...forms.equipo, nombre: e.target.value}})} required /></div>
                <div className="form-group"><label>Modalidad</label><input className="form-control" value={forms.equipo.modalidad} onChange={e => setForms({...forms, equipo: {...forms.equipo, modalidad: e.target.value}})} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="btn btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}

      {modal === 'tecnico' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Nuevo Técnico</h3><button className="btn btn-ghost" onClick={() => setModal(null)}>✕</button></div>
            <form onSubmit={e => { e.preventDefault(); create('tecnico', forms.tecnico); }}>
              <div className="modal-body">
                <div className="form-group"><label>Código</label><input className="form-control" value={forms.tecnico.codigo} onChange={e => setForms({...forms, tecnico: {...forms.tecnico, codigo: e.target.value}})} required /></div>
                <div className="form-group"><label>Nombre</label><input className="form-control" value={forms.tecnico.nombre} onChange={e => setForms({...forms, tecnico: {...forms.tecnico, nombre: e.target.value}})} required /></div>
                <div className="form-group"><label>Especialidad</label><input className="form-control" value={forms.tecnico.especialidad} onChange={e => setForms({...forms, tecnico: {...forms.tecnico, especialidad: e.target.value}})} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="btn btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Catalogo;

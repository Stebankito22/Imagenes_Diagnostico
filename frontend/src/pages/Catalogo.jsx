import { useState, useEffect } from 'react';
import { tiposEstudioApi, equiposApi, tecnicosApi } from '../api';

function Catalogo() {
  const [tipos, setTipos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [showTecnicoModal, setShowTecnicoModal] = useState(false);
  const [tipoForm, setTipoForm] = useState({ codigo: '', nombre: '', modalidad: '', precioBase: 0 });
  const [equipoForm, setEquipoForm] = useState({ codigo: '', nombre: '', modalidad: '' });
  const [tecnicoForm, setTecnicoForm] = useState({ codigo: '', nombre: '', especialidad: '' });

  const load = async () => {
    try {
      const [t, e, te] = await Promise.all([
        tiposEstudioApi.getAll(),
        equiposApi.getAll(),
        tecnicosApi.getAll(),
      ]);
      setTipos(t.data);
      setEquipos(e.data);
      setTecnicos(te.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateTipo = async (e) => {
    e.preventDefault();
    try {
      await tiposEstudioApi.create(tipoForm);
      setShowTipoModal(false);
      setTipoForm({ codigo: '', nombre: '', modalidad: '', precioBase: 0 });
      load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleCreateEquipo = async (e) => {
    e.preventDefault();
    try {
      await equiposApi.create(equipoForm);
      setShowEquipoModal(false);
      setEquipoForm({ codigo: '', nombre: '', modalidad: '' });
      load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleCreateTecnico = async (e) => {
    e.preventDefault();
    try {
      await tecnicosApi.create(tecnicoForm);
      setShowTecnicoModal(false);
      setTecnicoForm({ codigo: '', nombre: '', especialidad: '' });
      load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteTipo = async (codigo) => {
    if (!confirm(`¿Eliminar tipo ${codigo}?`)) return;
    try { await tiposEstudioApi.delete(codigo); load(); } catch (err) { alert('Error'); }
  };

  if (loading) return <div className="loading">Cargando catálogo...</div>;

  return (
    <div>
      <h2 className="mb-24">Catálogo</h2>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tipos de Estudio ({tipos.length})</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTipoModal(true)}>+ Agregar</button>
          </div>
          <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Modalidad</th><th>Precio</th><th></th></tr></thead>
            <tbody>
              {tipos.map(t => (
                <tr key={t.codigo}>
                  <td><strong>{t.codigo}</strong></td>
                  <td>{t.nombre}</td>
                  <td>{t.modalidad}</td>
                  <td>Bs. {t.precioBase?.toFixed(2)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteTipo(t.codigo)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Equipos ({equipos.length})</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowEquipoModal(true)}>+ Agregar</button>
          </div>
          <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Modalidad</th></tr></thead>
            <tbody>
              {equipos.map(e => (
                <tr key={e.codigo}>
                  <td><strong>{e.codigo}</strong></td>
                  <td>{e.nombre}</td>
                  <td>{e.modalidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <span className="card-title">Técnicos Ejecutores ({tecnicos.length})</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTecnicoModal(true)}>+ Agregar</button>
        </div>
        <table>
          <thead><tr><th>Código</th><th>Nombre</th><th>Especialidad</th></tr></thead>
          <tbody>
            {tecnicos.map(t => (
              <tr key={t.codigo}>
                <td><strong>{t.codigo}</strong></td>
                <td>{t.nombre}</td>
                <td>{t.especialidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTipoModal && (
        <div className="modal-overlay" onClick={() => setShowTipoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Nuevo Tipo de Estudio</h3><button className="modal-close" onClick={() => setShowTipoModal(false)}>×</button></div>
            <form onSubmit={handleCreateTipo}>
              <div className="form-row">
                <div className="form-group"><label>Código</label><input className="form-control" value={tipoForm.codigo} onChange={(e) => setTipoForm({ ...tipoForm, codigo: e.target.value })} required /></div>
                <div className="form-group"><label>Nombre</label><input className="form-control" value={tipoForm.nombre} onChange={(e) => setTipoForm({ ...tipoForm, nombre: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Modalidad</label><input className="form-control" value={tipoForm.modalidad} onChange={(e) => setTipoForm({ ...tipoForm, modalidad: e.target.value })} placeholder="Rayos X, TAC, RMN..." /></div>
                <div className="form-group"><label>Precio Base</label><input className="form-control" type="number" step="0.01" value={tipoForm.precioBase} onChange={(e) => setTipoForm({ ...tipoForm, precioBase: parseFloat(e.target.value) })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowTipoModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}

      {showEquipoModal && (
        <div className="modal-overlay" onClick={() => setShowEquipoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Nuevo Equipo</h3><button className="modal-close" onClick={() => setShowEquipoModal(false)}>×</button></div>
            <form onSubmit={handleCreateEquipo}>
              <div className="form-group"><label>Código</label><input className="form-control" value={equipoForm.codigo} onChange={(e) => setEquipoForm({ ...equipoForm, codigo: e.target.value })} required /></div>
              <div className="form-group"><label>Nombre</label><input className="form-control" value={equipoForm.nombre} onChange={(e) => setEquipoForm({ ...equipoForm, nombre: e.target.value })} required /></div>
              <div className="form-group"><label>Modalidad</label><input className="form-control" value={equipoForm.modalidad} onChange={(e) => setEquipoForm({ ...equipoForm, modalidad: e.target.value })} /></div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEquipoModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}

      {showTecnicoModal && (
        <div className="modal-overlay" onClick={() => setShowTecnicoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Nuevo Técnico</h3><button className="modal-close" onClick={() => setShowTecnicoModal(false)}>×</button></div>
            <form onSubmit={handleCreateTecnico}>
              <div className="form-group"><label>Código</label><input className="form-control" value={tecnicoForm.codigo} onChange={(e) => setTecnicoForm({ ...tecnicoForm, codigo: e.target.value })} required /></div>
              <div className="form-group"><label>Nombre</label><input className="form-control" value={tecnicoForm.nombre} onChange={(e) => setTecnicoForm({ ...tecnicoForm, nombre: e.target.value })} required /></div>
              <div className="form-group"><label>Especialidad</label><input className="form-control" value={tecnicoForm.especialidad} onChange={(e) => setTecnicoForm({ ...tecnicoForm, especialidad: e.target.value })} /></div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowTecnicoModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Crear</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalogo;

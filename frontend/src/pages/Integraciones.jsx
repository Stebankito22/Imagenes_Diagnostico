import { useState, useEffect } from 'react';
import { integracionesApi, BACKENDS } from '../api';

const AREAS = [
  { nombre: 'Consultas Externas', responsable: 'Wilson Yucra', color: 'var(--blue)', key: 'consultas', endpoints: ['GET /api/ordenes', 'POST /api/ordenes/resultado'] },
  { nombre: 'Hospitalización', responsable: 'Juan Cruz', color: 'var(--blue)', key: 'hospitalizacion', endpoints: ['GET /api/ordenes', 'POST /api/notificaciones/estudio-inicio'] },
  { nombre: 'Emergencias y Triaje', responsable: 'Alfredo Herbas', color: 'var(--red)', key: 'emergencias', endpoints: ['PATCH /api/integraciones/emergencias/priorizar/{orden}', 'GET /api/integraciones/emergencias/estado/{orden}'] },
  { nombre: 'Farmacia Hospitalaria', responsable: 'Sergio Villarrubia', color: 'var(--purple)', key: 'farmacia', endpoints: ['POST /api/integraciones/farmacia/contraste-usado', 'GET /api/integraciones/farmacia/contrastes-pendientes'] },
  { nombre: 'Facturación y Seguros', responsable: 'Carlos Balcazar', color: 'var(--green)', key: 'facturacion', endpoints: ['GET /api/integraciones/facturacion/estudios-finalizados'] },
  { nombre: 'Atención al Paciente', responsable: 'Enny Lopez', color: 'var(--blue)', key: 'atencion', endpoints: ['GET /api/integraciones/atencion/informes-listos'] },
  { nombre: 'Telemedicina', responsable: 'Ricardo Valencia', color: 'var(--purple)', key: 'telemedicina', endpoints: ['GET /api/integraciones/telemedicina/estudios-compartibles'] },
  { nombre: 'Recursos Humanos', responsable: 'Rodrigo Porcel', color: 'var(--green)', key: 'rrhh', endpoints: ['GET /api/integraciones/rrhh/tecnicos-activos'] },
  { nombre: 'Gestión de Inventarios', responsable: 'Juan Reyes', color: 'var(--amber)', key: 'inventarios', endpoints: ['GET /api/integraciones/inventarios/resumen-insumos'] },
  { nombre: 'Gestión de Pacientes', responsable: 'Abigail Rivera', color: 'var(--blue)', key: 'pacientes', endpoints: ['GET /api/pacientes/{id}'] },
];

function Integraciones() {
  const [factData, setFactData] = useState(null);
  const [informesListos, setInformesListos] = useState([]);
  const [contrastesPend, setContrastesPend] = useState([]);
  const [tecnicosAct, setTecnicosAct] = useState([]);
  const [insumos, setInsumos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergOrden, setEmergOrden] = useState('');
  const [emergResult, setEmergResult] = useState(null);
  const [farmCodigo, setFarmCodigo] = useState('');

  const load = async () => {
    try {
      const [f, il, cp, ta, ins] = await Promise.all([
        integracionesApi.estudiosFacturacion({}),
        integracionesApi.informesListos(),
        integracionesApi.contrastesPendientes(),
        integracionesApi.tecnicosActivos({}),
        integracionesApi.resumenInsumos({}),
      ]);
      setFactData(f.data); setInformesListos(il.data); setContrastesPend(cp.data);
      setTecnicosAct(ta.data); setInsumos(ins.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const priorizar = async () => {
    if (!emergOrden) return;
    try { const r = await integracionesApi.priorizarEmergencia(emergOrden); setEmergResult(r.data); }
    catch (err) { setEmergResult({ error: err.response?.data?.message || 'No encontrada' }); }
  };

  const registrarContraste = async () => {
    if (!farmCodigo) return;
    try { await integracionesApi.contrasteUsado({ codigoEstudio: farmCodigo }); alert('✅ Contraste registrado'); setFarmCodigo(''); load(); }
    catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <>
      <p className="text-muted mb-20">Endpoints para integración con los módulos de tus compañeros</p>

      <div className="grid-3 mb-20">
        {AREAS.map((a) => (
          <div className="integration-card" key={a.nombre} style={{ borderTop: `3px solid ${a.color}` }}>
            <h4>{a.nombre}</h4>
            <div className="resp">{a.responsable}</div>
            {a.endpoints.map((ep, i) => <code className="endpoint" key={i}>{ep}</code>)}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
          <div className="card-head"><h3>🚑 Emergencias — Priorizar Orden</h3></div>
          <div className="card-body pad">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control" placeholder="Código de orden (ORD-2026-...)" value={emergOrden} onChange={e => setEmergOrden(e.target.value)} />
              <button className="btn btn-danger" onClick={priorizar}>Priorizar</button>
            </div>
            {emergResult && (
              <div className="mt-16" style={{ padding: 12, borderRadius: 8, background: emergResult.error ? 'var(--red-light)' : 'var(--green-light)' }}>
                <span style={{ color: emergResult.error ? 'var(--red)' : 'var(--green)' }}>
                  {emergResult.error || `✅ ${emergResult.mensaje}`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--purple)' }}>
          <div className="card-head"><h3>💊 Farmacia — Registrar Contraste</h3></div>
          <div className="card-body pad">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control" placeholder="Código de estudio (EST-2026-...)" value={farmCodigo} onChange={e => setFarmCodigo(e.target.value)} />
              <button className="btn btn-primary" onClick={registrarContraste}>Registrar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
          <div className="card-head"><h3>💰 Facturación</h3></div>
          <div className="card-body pad">
            {factData ? (
              <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
                <div><div className="stat-value">{factData.totalEstudios}</div><div className="stat-label">Estudios Finalizados</div></div>
                <div><div className="stat-value">Bs. {factData.montoTotalEstimado?.toFixed(2)}</div><div className="stat-label">Monto Estimado</div></div>
              </div>
            ) : <div className="empty">Sin datos</div>}
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--amber)' }}>
          <div className="card-head"><h3>📦 Inventarios</h3></div>
          <div className="card-body pad">
            {insumos ? (
              <>
                <p>Total estudios: <strong>{insumos.totalEstudios}</strong></p>
                <p>Con contraste: <strong>{insumos.estudiosConContraste}</strong></p>
                <p>Dosis total: <strong>{insumos.dosisRadiacionTotal?.toFixed(2)} mGy</strong></p>
                <p>Dosis promedio: <strong>{insumos.dosisRadiacionPromedio?.toFixed(2)} mGy</strong></p>
              </>
            ) : <div className="empty">Sin datos</div>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><h3>👥 Atención al Paciente — Informes Listos para Entrega</h3></div>
        <div className="card-body">
          {informesListos.length === 0 ? <div className="empty">No hay informes listos</div> : (
            <table>
              <thead><tr><th>Informe</th><th>Orden</th><th>Paciente ID</th><th>Estudio</th><th>Radiólogo</th><th>Fecha</th></tr></thead>
              <tbody>
                {informesListos.map((inf, i) => (
                  <tr key={i}><td><strong>{inf.codigoInforme}</strong></td><td>{inf.codigoOrden}</td><td>{inf.pacienteId}</td>
                    <td>{inf.tipoEstudio}</td><td>{inf.radiologo}</td><td>{new Date(inf.fechaEmision).toLocaleDateString('es-BO')}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><h3>👨‍💼 RRHH — Técnicos Activos</h3></div>
        <div className="card-body">
          {tecnicosAct.length === 0 ? <div className="empty">Sin datos</div> : (
            <table>
              <thead><tr><th>Código</th><th>Nombre</th><th>Especialidad</th><th>Total Estudios</th><th>Último Estudio</th></tr></thead>
              <tbody>
                {tecnicosAct.map((t, i) => (
                  <tr key={i}><td><span className="badge badge-gray">{t.codigoTecnico}</span></td><td>{t.nombreTecnico}</td><td>{t.especialidad}</td>
                    <td><strong>{t.totalEstudios}</strong></td><td>{new Date(t.ultimoEstudio).toLocaleDateString('es-BO')}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><h3>⚙️ Configuración de Backends</h3></div>
        <div className="card-body">
          <table>
            <thead><tr><th>Área</th><th>Responsable</th><th>URL Configurada</th></tr></thead>
            <tbody>
              {AREAS.map(a => (
                <tr key={a.key}>
                  <td><strong>{a.nombre}</strong></td><td>{a.responsable}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{BACKENDS[a.key] || 'Sin configurar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Integraciones;

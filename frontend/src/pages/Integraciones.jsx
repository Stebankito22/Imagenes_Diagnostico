import { useState, useEffect } from 'react';
import { integracionesApi, BACKENDS } from '../api';

const AREAS = [
  { nombre: 'Consultas Externas', responsable: 'Wilson Yucra', color: 'var(--primary)', key: 'consultas', endpoints: ['GET /api/ordenes', 'POST /api/ordenes/resultado'] },
  { nombre: 'Hospitalización', responsable: 'Juan Cruz', color: 'var(--primary)', key: 'hospitalizacion', endpoints: ['GET /api/ordenes', 'POST /api/notificaciones/estudio-inicio'] },
  { nombre: 'Emergencias y Triaje', responsable: 'Alfredo Herbas', color: 'var(--danger)', key: 'emergencias', endpoints: ['GET /api/triage/estado/{codigo}', 'PATCH /api/ordenesimagen/.../priorizar'] },
  { nombre: 'Farmacia Hospitalaria', responsable: 'Sergio Villarrubia', color: 'var(--info)', key: 'farmacia', endpoints: ['GET /api/inventario/contraste', 'POST /api/facturar/estudio'] },
  { nombre: 'Facturación y Seguros', responsable: 'Carlos Balcazar', color: 'var(--success)', key: 'facturacion', endpoints: ['GET /api/facturar/estudio', 'POST /api/facturar/estudio'] },
  { nombre: 'Atención al Paciente', responsable: 'Enny Lopez', color: 'var(--info)', key: 'atencion', endpoints: ['GET /api/notificaciones/informe', 'POST /api/notificaciones/informe'] },
  { nombre: 'Telemedicina', responsable: 'Ricardo Valencia', color: 'var(--primary)', key: 'telemedicina', endpoints: ['GET /api/segunda-opinion', 'POST /api/segunda-opinion/compartir'] },
  { nombre: 'Recursos Humanos', responsable: 'Rodrigo Porcel', color: 'var(--success)', key: 'rrhh', endpoints: ['GET /api/personal/validar/{codigo}'] },
  { nombre: 'Gestión de Inventarios', responsable: 'Juan Reyes', color: 'var(--warning)', key: 'inventarios', endpoints: ['GET /api/inventario', 'POST /api/inventario/usar'] },
  { nombre: 'Gestión de Pacientes', responsable: 'Abigail Rivera', color: 'var(--primary)', key: 'pacientes', endpoints: ['GET /api/pacientes/{id}'] },
];

function Integraciones() {
  const [facturacionData, setFacturacionData] = useState(null);
  const [informesListos, setInformesListos] = useState([]);
  const [contrastesPendientes, setContrastesPendientes] = useState([]);
  const [tecnicosActivos, setTecnicosActivos] = useState([]);
  const [insumosData, setInsumosData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergenciaOrden, setEmergenciaOrden] = useState('');
  const [emergenciaResult, setEmergenciaResult] = useState(null);
  const [farmaciaCodigo, setFarmaciaCodigo] = useState('');
  const [backendsStatus, setBackendsStatus] = useState({});
  const [showConfig, setShowConfig] = useState(false);

  const load = async () => {
    try {
      const [fact, informes, contrastes, tecnicos, insumos] = await Promise.all([
        integracionesApi.estudiosFacturacion({}),
        integracionesApi.informesListos(),
        integracionesApi.contrastesPendientes(),
        integracionesApi.tecnicosActivos({}),
        integracionesApi.resumenInsumos({}),
      ]);
      setFacturacionData(fact.data);
      setInformesListos(informes.data);
      setContrastesPendientes(contrastes.data);
      setTecnicosActivos(tecnicos.data);
      setInsumosData(insumos.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const checkBackends = async () => {
    const results = {};
    for (const [key, url] of Object.entries(BACKENDS)) {
      try {
        const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        results[key] = { status: 'online', url };
      } catch {
        results[key] = { status: 'offline', url };
      }
    }
    setBackendsStatus(results);
  };

  useEffect(() => { checkBackends(); }, []);

  const handlePriorizar = async () => {
    if (!emergenciaOrden) return;
    try {
      const res = await integracionesApi.priorizarEmergencia(emergenciaOrden);
      setEmergenciaResult(res.data);
    } catch (err) {
      setEmergenciaResult({ error: err.response?.data?.message || 'No encontrada' });
    }
  };

  const handleContrasteUsado = async () => {
    if (!farmaciaCodigo) return;
    try {
      await integracionesApi.contrasteUsado({ codigoEstudio: farmaciaCodigo });
      alert('Contraste registrado exitosamente');
      setFarmaciaCodigo('');
      load();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="loading">Cargando integraciones...</div>;

  return (
    <div>
      <div className="flex-between mb-24">
        <h2>Integraciones - Endpoints para Compañeros</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={checkBackends}>🔄 Verificar Backends</button>
          <button className="btn btn-outline" onClick={() => setShowConfig(!showConfig)}>⚙️ Configurar URLs</button>
        </div>
      </div>

      {showConfig && (
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--gray-400)' }}>
          <div className="card-header"><span className="card-title">URLs de Backends</span></div>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
            Configura las URLs de cada compañero. Editá <code>frontend/.env</code> para producción.
          </p>
          <table>
            <thead><tr><th>Área</th><th>URL configurada</th><th>Estado</th></tr></thead>
            <tbody>
              {AREAS.map((area) => (
                <tr key={area.key}>
                  <td>{area.nombre}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{backendsStatus[area.key]?.url || 'Sin configurar'}</td>
                  <td>
                    {backendsStatus[area.key]?.status === 'online' ? (
                      <span className="badge badge-completed">Online</span>
                    ) : (
                      <span className="badge badge-inactive">Offline / No verificado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="integration-grid mb-24">
        {AREAS.map((area) => (
          <div className="integration-card" key={area.nombre} style={{ borderLeftColor: area.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>{area.nombre}</h4>
              <span className={`badge ${backendsStatus[area.key]?.status === 'online' ? 'badge-completed' : 'badge-inactive'}`}>
                {backendsStatus[area.key]?.status === 'online' ? '●' : '○'}
              </span>
            </div>
            <div className="responsable">{area.responsable}</div>
            <div className="endpoints">
              {area.endpoints.map((ep, i) => (
                <div key={i} style={{ fontFamily: 'monospace', padding: '2px 0', fontSize: 11 }}>{ep}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="card-header"><span className="card-title">🚑 Emergencias - Priorizar Orden</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder="Código de orden" value={emergenciaOrden} onChange={(e) => setEmergenciaOrden(e.target.value)} />
            <button className="btn btn-danger" onClick={handlePriorizar}>Priorizar</button>
          </div>
          {emergenciaResult && (
            <div className="mt-16" style={{ padding: 12, borderRadius: 8, background: emergenciaResult.error ? 'var(--danger-light)' : 'var(--success-light)' }}>
              {emergenciaResult.error ? (
                <span style={{ color: 'var(--danger)' }}>{emergenciaResult.error}</span>
              ) : (
                <span style={{ color: 'var(--success)' }}>✅ {emergenciaResult.mensaje}</span>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="card-header"><span className="card-title">💊 Farmacia - Registrar Contraste</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder="Código de estudio" value={farmaciaCodigo} onChange={(e) => setFarmaciaCodigo(e.target.value)} />
            <button className="btn btn-primary" onClick={handleContrasteUsado}>Registrar</button>
          </div>
        </div>
      </div>

      <div className="grid-2 mt-16">
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="card-header"><span className="card-title">💰 Facturación - Estudios Finalizados</span></div>
          {facturacionData ? (
            <div className="stats-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card primary"><span className="stat-value">{facturacionData.totalEstudios}</span><span className="stat-label">Estudios</span></div>
              <div className="stat-card success"><span className="stat-value">Bs. {facturacionData.montoTotalEstimado?.toFixed(2)}</span><span className="stat-label">Monto Total</span></div>
            </div>
          ) : <div className="empty">Sin datos</div>}
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="card-header"><span className="card-title">📦 Inventarios - Resumen de Insumos</span></div>
          {insumosData ? (
            <>
              <p>Total estudios: <strong>{insumosData.totalEstudios}</strong></p>
              <p>Con contraste: <strong>{insumosData.estudiosConContraste}</strong></p>
              <p>Dosis total: <strong>{insumosData.dosisRadiacionTotal?.toFixed(2)} mGy</strong></p>
              <p>Dosis promedio: <strong>{insumosData.dosisRadiacionPromedio?.toFixed(2)} mGy</strong></p>
            </>
          ) : <div className="empty">Sin datos</div>}
        </div>
      </div>

      <div className="card mt-16" style={{ borderLeft: '4px solid var(--info)' }}>
        <div className="card-header"><span className="card-title">👥 Atención al Paciente - Informes Listos</span></div>
        {informesListos.length === 0 ? <div className="empty">No hay informes listos</div> : (
          <table>
            <thead><tr><th>Informe</th><th>Orden</th><th>Paciente ID</th><th>Estudio</th><th>Radiólogo</th><th>Fecha</th></tr></thead>
            <tbody>
              {informesListos.map((inf, i) => (
                <tr key={i}>
                  <td><strong>{inf.codigoInforme}</strong></td><td>{inf.codigoOrden}</td><td>{inf.pacienteId}</td>
                  <td>{inf.tipoEstudio}</td><td>{inf.radiologo}</td>
                  <td>{new Date(inf.fechaEmision).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mt-16">
        <div className="card-header"><span className="card-title">👨‍💼 RRHH - Técnicos Activos</span></div>
        {tecnicosActivos.length === 0 ? <div className="empty">Sin datos</div> : (
          <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Especialidad</th><th>Total Estudios</th><th>Último Estudio</th></tr></thead>
            <tbody>
              {tecnicosActivos.map((t, i) => (
                <tr key={i}><td><strong>{t.codigoTecnico}</strong></td><td>{t.nombreTecnico}</td><td>{t.especialidad}</td>
                  <td>{t.totalEstudios}</td><td>{new Date(t.ultimoEstudio).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Integraciones;

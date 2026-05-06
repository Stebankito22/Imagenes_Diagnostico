import { useState, useEffect } from 'react';
import { integracionesApi, ordenesApi } from '../api';

const AREAS = [
  { nombre: 'Consultas Externas', responsable: 'Wilson Yucra', color: 'var(--primary)', endpoints: ['POST /api/ordenesimagen', 'GET /api/informes/resultado/{orden}'] },
  { nombre: 'Hospitalización', responsable: 'Juan Cruz', color: 'var(--primary)', endpoints: ['POST /api/ordenesimagen/orden-examen', 'GET /api/ordenesimagen/orden-examen/{orden}'] },
  { nombre: 'Emergencias y Triaje', responsable: 'Alfredo Herbas', color: 'var(--danger)', endpoints: ['PATCH /api/integraciones/emergencias/priorizar/{orden}', 'GET /api/integraciones/emergencias/estado/{orden}'] },
  { nombre: 'Farmacia Hospitalaria', responsable: 'Sergio Villarrubia', color: 'var(--info)', endpoints: ['POST /api/integraciones/farmacia/contraste-usado', 'GET /api/integraciones/farmacia/contrastes-pendientes'] },
  { nombre: 'Facturación y Seguros', responsable: 'Carlos Balcazar', color: 'var(--success)', endpoints: ['GET /api/integraciones/facturacion/estudios-finalizados'] },
  { nombre: 'Atención al Paciente', responsable: 'Enny Lopez', color: 'var(--info)', endpoints: ['GET /api/integraciones/atencion/informes-listos'] },
  { nombre: 'Telemedicina', responsable: 'Ricardo Valencia', color: 'var(--primary)', endpoints: ['GET /api/integraciones/telemedicina/estudios-compartibles'] },
  { nombre: 'Recursos Humanos', responsable: 'Rodrigo Porcel', color: 'var(--success)', endpoints: ['GET /api/integraciones/rrhh/tecnicos-activos'] },
  { nombre: 'Gestión de Inventarios', responsable: 'Juan Reyes', color: 'var(--warning)', endpoints: ['GET /api/integraciones/inventarios/resumen-insumos'] },
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
      <h2 className="mb-24">Integraciones - Endpoints para Compañeros</h2>

      <div className="integration-grid mb-24">
        {AREAS.map((area) => (
          <div className="integration-card" key={area.nombre} style={{ borderLeftColor: area.color }}>
            <h4>{area.nombre}</h4>
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
          <div className="card-header">
            <span className="card-title">🚑 Emergencias - Priorizar Orden</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder="Código de orden (ej: ORD-001)" value={emergenciaOrden} onChange={(e) => setEmergenciaOrden(e.target.value)} />
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
          <div className="card-header">
            <span className="card-title">💊 Farmacia - Registrar Contraste</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder="Código de estudio (ej: EST-001)" value={farmaciaCodigo} onChange={(e) => setFarmaciaCodigo(e.target.value)} />
            <button className="btn btn-primary" onClick={handleContrasteUsado}>Registrar</button>
          </div>
        </div>
      </div>

      <div className="grid-2 mt-16">
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="card-header">
            <span className="card-title">💰 Facturación - Estudios Finalizados</span>
          </div>
          {facturacionData ? (
            <>
              <div className="stats-grid" style={{ marginBottom: 16 }}>
                <div className="stat-card primary"><span className="stat-value">{facturacionData.totalEstudios}</span><span className="stat-label">Estudios</span></div>
                <div className="stat-card success"><span className="stat-value">Bs. {facturacionData.montoTotalEstimado?.toFixed(2)}</span><span className="stat-label">Monto Total</span></div>
              </div>
            </>
          ) : (
            <div className="empty">Sin datos</div>
          )}
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="card-header">
            <span className="card-title">📦 Inventarios - Resumen de Insumos</span>
          </div>
          {insumosData ? (
            <>
              <p>Total estudios: <strong>{insumosData.totalEstudios}</strong></p>
              <p>Con contraste: <strong>{insumosData.estudiosConContraste}</strong></p>
              <p>Dosis total: <strong>{insumosData.dosisRadiacionTotal?.toFixed(2)} mGy</strong></p>
              <p>Dosis promedio: <strong>{insumosData.dosisRadiacionPromedio?.toFixed(2)} mGy</strong></p>
            </>
          ) : (
            <div className="empty">Sin datos</div>
          )}
        </div>
      </div>

      <div className="card mt-16" style={{ borderLeft: '4px solid var(--info)' }}>
        <div className="card-header">
          <span className="card-title">👥 Atención al Paciente - Informes Listos para Entrega</span>
        </div>
        {informesListos.length === 0 ? (
          <div className="empty">No hay informes listos</div>
        ) : (
          <table>
            <thead><tr><th>Informe</th><th>Orden</th><th>Paciente ID</th><th>Estudio</th><th>Radiólogo</th><th>Fecha</th></tr></thead>
            <tbody>
              {informesListos.map((inf, i) => (
                <tr key={i}>
                  <td><strong>{inf.codigoInforme}</strong></td>
                  <td>{inf.codigoOrden}</td>
                  <td>{inf.pacienteId}</td>
                  <td>{inf.tipoEstudio}</td>
                  <td>{inf.radiologo}</td>
                  <td>{new Date(inf.fechaEmision).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <span className="card-title">👨‍💼 RRHH - Técnicos Activos</span>
        </div>
        {tecnicosActivos.length === 0 ? (
          <div className="empty">Sin datos</div>
        ) : (
          <table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Especialidad</th><th>Total Estudios</th><th>Último Estudio</th></tr></thead>
            <tbody>
              {tecnicosActivos.map((t, i) => (
                <tr key={i}>
                  <td><strong>{t.codigoTecnico}</strong></td>
                  <td>{t.nombreTecnico}</td>
                  <td>{t.especialidad}</td>
                  <td>{t.totalEstudios}</td>
                  <td>{new Date(t.ultimoEstudio).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Integraciones;

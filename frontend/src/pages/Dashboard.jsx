import { useState, useEffect } from 'react';
import { ordenesApi, estudiosApi, informesApi, integracionesApi } from '../api';

function Dashboard({ onStats }) {
  const [stats, setStats] = useState({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const load = async () => {
    try {
      const [ordenes, estudios, pendientes, firmados, sinEstudio, modalidad, urgencia, ranking] =
        await Promise.all([
          ordenesApi.getAll(),
          estudiosApi.getAll(),
          estudiosApi.pendientesInforme(),
          informesApi.firmados(),
          ordenesApi.sinEstudio(),
          estudiosApi.contarPorModalidad(),
          estudiosApi.porUrgencia(),
          estudiosApi.rankingTipos(),
        ]);

      const totalIngreso = estudios.data.reduce((sum, e) => sum + (e.precio || 0), 0);
      setStats({
        ordenes: ordenes.data.length,
        estudios: estudios.data.length,
        pendientes: pendientes.data.length,
        firmados: firmados.data.length,
        sinEstudio: sinEstudio.data.length,
        ingreso: totalIngreso,
      });
      setData({ modalidad: modalidad.data, urgencia: urgencia.data, ranking: ranking.data, pendientes: pendientes.data.slice(0, 5) });
      if (onStats) onStats({ pendientes: pendientes.data.length });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const json = await res.json();
      setSeedResult(json);
      setTimeout(() => { setShowSeedModal(false); load(); }, 1500);
    } catch (err) {
      setSeedResult({ error: err.message });
    }
  };

  if (loading) return <div className="loading">Cargando datos...</div>;

  const hasData = stats.estudios > 0;

  return (
    <>
      <div className="flex-between mb-20">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Resumen General</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Estado actual del servicio de diagnóstico por imágenes</p>
        </div>
        {!hasData && (
          <button className="btn btn-primary" onClick={() => setShowSeedModal(true)}>
            ⚡ Cargar datos de demostración
          </button>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
          </div>
          <div><div className="stat-value">{stats.ordenes || 0}</div><div className="stat-label">Órdenes Totales</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div><div className="stat-value">{stats.estudios || 0}</div><div className="stat-label">Estudios Realizados</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          </div>
          <div><div className="stat-value">{stats.pendientes || 0}</div><div className="stat-label">Pendientes de Informe</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15l2 2 4-4"/></svg>
          </div>
          <div><div className="stat-value">{stats.firmados || 0}</div><div className="stat-label">Informes Firmados</div></div>
        </div>
      </div>

      {!hasData && (
        <div className="card" style={{ borderLeft: '3px solid var(--blue)' }}>
          <div className="card-body pad" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🩻</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Bienvenido al Sistema de Diagnóstico por Imágenes</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              No hay datos registrados aún. Carga datos de demostración para ver el funcionamiento completo.
            </p>
            <button className="btn btn-primary" onClick={() => setShowSeedModal(true)}>
              ⚡ Cargar datos de demostración
            </button>
          </div>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head"><h3>Estudios por Modalidad</h3></div>
              <div className="card-body">
                <table>
                  <thead><tr><th>Modalidad</th><th style={{ textAlign: 'right' }}>Cantidad</th></tr></thead>
                  <tbody>
                    {data.modalidad?.map((m, i) => (
                      <tr key={i}><td>{m.modalidad}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{m.cantidad}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Nivel de Urgencia</h3></div>
              <div className="card-body">
                <table>
                  <thead><tr><th>Urgencia</th><th style={{ textAlign: 'right' }}>Cantidad</th></tr></thead>
                  <tbody>
                    {data.urgencia?.map((u, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`badge ${u.urgencia === 'Emergencia' ? 'badge-red' : u.urgencia === 'Urgente' ? 'badge-amber' : 'badge-blue'}`}>
                            {u.urgencia}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{u.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 20 }}>
            <div className="card">
              <div className="card-head"><h3>Tipos de Estudio Más Solicitados</h3></div>
              <div className="card-body">
                <table>
                  <thead><tr><th>#</th><th>Tipo de Estudio</th><th style={{ textAlign: 'right' }}>Cantidad</th></tr></thead>
                  <tbody>
                    {data.ranking?.slice(0, 6).map((r, i) => (
                      <tr key={i}><td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td><td>{r.tipoEstudio}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{r.cantidad}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Últimos Pendientes</h3></div>
              <div className="card-body">
                <table>
                  <thead><tr><th>Orden</th><th>Tipo</th><th>Urgencia</th></tr></thead>
                  <tbody>
                    {data.pendientes?.map((p, i) => (
                      <tr key={i}>
                        <td><strong>{p.codigoOrden}</strong></td>
                        <td>{p.tipoEstudioSolicitado || '—'}</td>
                        <td><span className={`badge ${p.urgencia === 'Emergencia' ? 'badge-red' : 'badge-amber'}`}>{p.urgencia}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {showSeedModal && (
        <div className="modal-overlay" onClick={() => setShowSeedModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Cargar Datos de Demostración</h3><button className="btn btn-ghost" onClick={() => setShowSeedModal(false)}>✕</button></div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Se cargarán 12 tipos de estudio, 7 equipos, 6 técnicos, 12 órdenes, 10 estudios y 6 informes radiológicos con datos realistas.
              </p>
              {seedResult && (
                <div style={{ padding: 12, borderRadius: 8, background: seedResult.error ? 'var(--red-light)' : 'var(--green-light)' }}>
                  <span style={{ color: seedResult.error ? 'var(--red)' : 'var(--green)' }}>
                    {seedResult.error || `✅ ${seedResult.mensaje}`}
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowSeedModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSeed}>Cargar Datos</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;

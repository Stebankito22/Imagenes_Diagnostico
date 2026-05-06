import { useState, useEffect } from 'react';
import { ordenesApi, estudiosApi, informesApi } from '../api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalOrdenes: 0,
    totalEstudios: 0,
    pendientesInforme: 0,
    informesFirmados: 0,
    sinEstudio: 0,
  });
  const [modalidadData, setModalidadData] = useState([]);
  const [urgenciaData, setUrgenciaData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        setStats({
          totalOrdenes: ordenes.data.length,
          totalEstudios: estudios.data.length,
          pendientesInforme: pendientes.data.length,
          informesFirmados: firmados.data.length,
          sinEstudio: sinEstudio.data.length,
        });
        setModalidadData(modalidad.data);
        setUrgenciaData(urgencia.data);
        setRankingData(ranking.data);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card primary">
          <span className="stat-value">{stats.totalOrdenes}</span>
          <span className="stat-label">Total Órdenes</span>
        </div>
        <div className="stat-card success">
          <span className="stat-value">{stats.totalEstudios}</span>
          <span className="stat-label">Estudios Realizados</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">{stats.pendientesInforme}</span>
          <span className="stat-label">Pendientes de Informe</span>
        </div>
        <div className="stat-card info">
          <span className="stat-value">{stats.informesFirmados}</span>
          <span className="stat-label">Informes Firmados</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-value">{stats.sinEstudio}</span>
          <span className="stat-label">Órdenes Sin Estudio</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Estudios por Modalidad</span>
          </div>
          {modalidadData.length === 0 ? (
            <div className="empty">Sin datos</div>
          ) : (
            <table>
              <thead>
                <tr><th>Modalidad</th><th className="text-right">Cantidad</th></tr>
              </thead>
              <tbody>
                {modalidadData.map((item, i) => (
                  <tr key={i}>
                    <td>{item.modalidad}</td>
                    <td className="text-right">{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Estudios por Urgencia</span>
          </div>
          {urgenciaData.length === 0 ? (
            <div className="empty">Sin datos</div>
          ) : (
            <table>
              <thead>
                <tr><th>Urgencia</th><th className="text-right">Cantidad</th></tr>
              </thead>
              <tbody>
                {urgenciaData.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${item.urgencia === 'Emergencia' ? 'badge-emergency' : item.urgencia === 'Urgente' ? 'badge-pending' : 'badge-active'}`}>
                        {item.urgencia}
                      </span>
                    </td>
                    <td className="text-right">{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <span className="card-title">Top Tipos de Estudio Más Solicitados</span>
        </div>
        {rankingData.length === 0 ? (
          <div className="empty">Sin datos</div>
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Tipo de Estudio</th><th className="text-right">Cantidad</th></tr>
            </thead>
            <tbody>
              {rankingData.slice(0, 10).map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.tipoEstudio}</td>
                  <td className="text-right">{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

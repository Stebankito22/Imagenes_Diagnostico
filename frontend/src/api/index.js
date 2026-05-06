import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5211/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const ordenesApi = {
  getAll: () => api.get('/ordenesimagen'),
  getByCodigo: (codigo) => api.get(`/ordenesimagen/${codigo}`),
  create: (data) => api.post('/ordenesimagen', data),
  update: (codigo, data) => api.put(`/ordenesimagen/${codigo}`, data),
  delete: (codigo) => api.delete(`/ordenesimagen/${codigo}`),
  sinEstudio: () => api.get('/ordenesimagen/sin-estudio'),
  createOrdenExamen: (data) => api.post('/ordenesimagen/orden-examen', data),
  getOrdenExamen: (codigo) => api.get(`/ordenesimagen/orden-examen/${codigo}`),
};

export const estudiosApi = {
  getAll: () => api.get('/estudiosrealizados'),
  getByCodigo: (codigo) => api.get(`/estudiosrealizados/${codigo}`),
  create: (data) => api.post('/estudiosrealizados', data),
  update: (codigo, data) => api.put(`/estudiosrealizados/${codigo}`, data),
  delete: (codigo) => api.delete(`/estudiosrealizados/${codigo}`),
  pendientesInforme: () => api.get('/estudiosrealizados/pendientes-informe'),
  hoyPorTecnico: (codigo) => api.get(`/estudiosrealizados/hoy-por-tecnico/${codigo}`),
  contrastePendiente: () => api.get('/estudiosrealizados/contraste-pendiente'),
  contarPorModalidad: () => api.get('/estudiosrealizados/contar-por-modalidad'),
  sumaPrecios: () => api.get('/estudiosrealizados/suma-precios-por-modalidad'),
  porUrgencia: () => api.get('/estudiosrealizados/por-urgencia'),
  produccionMensual: (anio, mes) => api.get('/estudiosrealizados/produccion-mensual', { params: { anio, mes } }),
  tiempoPromedio: () => api.get('/estudiosrealizados/tiempo-promedio'),
  equiposTop: (fechaInicio, fechaFin) => api.get('/estudiosrealizados/equipos-top', { params: { fechaInicio, fechaFin } }),
  dosisAcumulada: () => api.get('/estudiosrealizados/dosis-acumulada'),
  rankingTipos: () => api.get('/estudiosrealizados/ranking-tipos'),
};

export const informesApi = {
  getAll: () => api.get('/informes'),
  getByCodigo: (codigo) => api.get(`/informes/${codigo}`),
  create: (data) => api.post('/informes', data),
  update: (codigo, data) => api.put(`/informes/${codigo}`, data),
  delete: (codigo) => api.delete(`/informes/${codigo}`),
  getResultado: (codigoOrden) => api.get(`/informes/resultado/${codigoOrden}`),
  pendientes: () => api.get('/informes/pendientes'),
  firmados: () => api.get('/informes/firmados'),
};

export const tiposEstudioApi = {
  getAll: () => api.get('/tiposestudio'),
  getByCodigo: (codigo) => api.get(`/tiposestudio/${codigo}`),
  create: (data) => api.post('/tiposestudio', data),
  update: (codigo, data) => api.put(`/tiposestudio/${codigo}`, data),
  delete: (codigo) => api.delete(`/tiposestudio/${codigo}`),
};

export const equiposApi = {
  getAll: () => api.get('/equipos'),
  getByCodigo: (codigo) => api.get(`/equipos/${codigo}`),
  create: (data) => api.post('/equipos', data),
};

export const tecnicosApi = {
  getAll: () => api.get('/tecnicos'),
  getByCodigo: (codigo) => api.get(`/tecnicos/${codigo}`),
  create: (data) => api.post('/tecnicos', data),
};

export const integracionesApi = {
  priorizarEmergencia: (codigoOrden) => api.patch(`/integraciones/emergencias/priorizar/${codigoOrden}`),
  estadoEmergencia: (codigoOrden) => api.get(`/integraciones/emergencias/estado/${codigoOrden}`),
  contrasteUsado: (data) => api.post('/integraciones/farmacia/contraste-usado', data),
  contrastesPendientes: () => api.get('/integraciones/farmacia/contrastes-pendientes'),
  estudiosFacturacion: (params) => api.get('/integraciones/facturacion/estudios-finalizados', { params }),
  informesListos: () => api.get('/integraciones/atencion/informes-listos'),
  estudiosTelemedicina: () => api.get('/integraciones/telemedicina/estudios-compartibles'),
  tecnicosActivos: (params) => api.get('/integraciones/rrhh/tecnicos-activos', { params }),
  resumenInsumos: (params) => api.get('/integraciones/inventarios/resumen-insumos', { params }),
};

export default api;

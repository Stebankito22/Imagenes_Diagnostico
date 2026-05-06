import axios from 'axios';

// ======================== URLs DE BACKENDS ========================
// Cada compañero expone su API en su propio servidor
const BACKENDS = {
  imagenes: import.meta.env.VITE_API_IMAGENES || 'http://localhost:5211/api',
  pacientes: import.meta.env.VITE_API_PACIENTES || 'http://localhost:5001/api',
  consultas: import.meta.env.VITE_API_CONSULTAS || 'http://localhost:5002/api',
  hospitalizacion: import.meta.env.VITE_API_HOSPITALIZACION || 'http://localhost:5003/api',
  emergencias: import.meta.env.VITE_API_EMERGENCIAS || 'http://localhost:5004/api',
  farmacia: import.meta.env.VITE_API_FARMACIA || 'http://localhost:5005/api',
  inventarios: import.meta.env.VITE_API_INVENTARIOS || 'http://localhost:5006/api',
  facturacion: import.meta.env.VITE_API_FACTURACION || 'http://localhost:5007/api',
  atencion: import.meta.env.VITE_API_ATENCION || 'http://localhost:5008/api',
  telemedicina: import.meta.env.VITE_API_TELEMEDICINA || 'http://localhost:5009/api',
  rrhh: import.meta.env.VITE_API_RRHH || 'http://localhost:5010/api',
};

const createApi = (baseURL) =>
  axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

// ======================== NUESTRA API (Diagnóstico por Imágenes) ========================
const api = createApi(BACKENDS.imagenes);
const apiPacientes = createApi(BACKENDS.pacientes);
const apiConsultas = createApi(BACKENDS.consultas);
const apiHospitalizacion = createApi(BACKENDS.hospitalizacion);
const apiEmergencias = createApi(BACKENDS.emergencias);
const apiFarmacia = createApi(BACKENDS.farmacia);
const apiInventarios = createApi(BACKENDS.inventarios);
const apiFacturacion = createApi(BACKENDS.facturacion);
const apiAtencion = createApi(BACKENDS.atencion);
const apiTelemedicina = createApi(BACKENDS.telemedicina);
const apiRRHH = createApi(BACKENDS.rrhh);

// ======================== NUESTRAS ENTIDADES ========================
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

// ======================== ENDPOINTS DE COMPAÑEROS (desde sus backends) ========================
export const integracionesApi = {
  // Emergencias (Alfredo Herbas)
  priorizarEmergencia: (codigoOrden) => api.patch(`/integraciones/emergencias/priorizar/${codigoOrden}`),
  estadoEmergencia: (codigoOrden) => api.get(`/integraciones/emergencias/estado/${codigoOrden}`),
  getEstadoEmergenciaExterno: (codigo) => apiEmergencias.get(`/triage/estado/${codigo}`).catch(() => null),

  // Farmacia (Sergio Villarrubia)
  contrasteUsado: (data) => api.post('/integraciones/farmacia/contraste-usado', data),
  contrastesPendientes: () => api.get('/integraciones/farmacia/contrastes-pendientes'),
  getInventarioContraste: () => apiFarmacia.get('/inventario/contraste').catch(() => null),

  // Facturación (Carlos Balcazar)
  estudiosFacturacion: (params) => api.get('/integraciones/facturacion/estudios-finalizados', { params }),
  notificarEstudioFinalizado: (data) => apiFacturacion.post('/facturar/estudio', data).catch(() => null),

  // Atención al Paciente (Enny Lopez)
  informesListos: () => api.get('/integraciones/atencion/informes-listos'),
  notificarInformeListo: (data) => apiAtencion.post('/notificaciones/informe', data).catch(() => null),

  // Telemedicina (Ricardo Valencia)
  estudiosTelemedicina: () => api.get('/integraciones/telemedicina/estudios-compartibles'),
  compartirEstudio: (data) => apiTelemedicina.post('/segunda-opinion/compartir', data).catch(() => null),

  // RRHH (Rodrigo Porcel)
  tecnicosActivos: (params) => api.get('/integraciones/rrhh/tecnicos-activos', { params }),
  validarCredencial: (codigo) => apiRRHH.get(`/personal/validar/${codigo}`).catch(() => null),

  // Inventarios (Juan Reyes)
  resumenInsumos: (params) => api.get('/integraciones/inventarios/resumen-insumos', { params }),
  notificarInsumoUsado: (data) => apiInventarios.post('/inventario/usar', data).catch(() => null),

  // Pacientes (Abigail Rivera)
  getPaciente: (id) => apiPacientes.get(`/pacientes/${id}`).catch(() => null),
  buscarPaciente: (query) => apiPacientes.get('/pacientes', { params: { q: query } }).catch(() => null),

  // Consultas Externas (Wilson Yucra)
  getOrdenesExternas: () => apiConsultas.get('/ordenes').catch(() => null),
  recibirResultado: (data) => apiConsultas.post('/ordenes/resultado', data).catch(() => null),

  // Hospitalización (Juan Cruz)
  getOrdenesHospitalizacion: () => apiHospitalizacion.get('/ordenes').catch(() => null),
  notificarEstudioInicio: (data) => apiHospitalizacion.post('/notificaciones/estudio-inicio', data).catch(() => null),
};

export { BACKENDS };
export default api;

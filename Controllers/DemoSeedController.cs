using Microsoft.AspNetCore.Mvc;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Endpoint para cargar datos de demostración.
/// Solo usar en desarrollo/demo. Eliminar en producción.
/// </summary>
[ApiController]
[Route("api/demo")]
public class DemoSeedController : ControllerBase
{
    private readonly AppDbContext _context;

    public DemoSeedController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("seed")]
    public ActionResult SeedData()
    {
        if (_context.TiposEstudio.Any())
            return Ok(new { mensaje = "Los datos de demo ya existen." });

        // ======================== TIPOS DE ESTUDIO ========================
        var tipos = new List<TipoEstudio>
        {
            new() { Codigo = "RX-TORAX", Nombre = "Radiografía de Tórax PA", Modalidad = "Rayos X", PrecioBase = 80, RequiereContraste = false },
            new() { Codigo = "RX-ABDOMEN", Nombre = "Radiografía de Abdomen Simple", Modalidad = "Rayos X", PrecioBase = 85, RequiereContraste = false },
            new() { Codigo = "RX-COLUMNA", Nombre = "Radiografía de Columna Lumbar", Modalidad = "Rayos X", PrecioBase = 90, RequiereContraste = false },
            new() { Codigo = "TAC-CRANEO", Nombre = "TAC de Cráneo Simple", Modalidad = "TAC", PrecioBase = 350, RequiereContraste = false },
            new() { Codigo = "TAC-TORAX", Nombre = "TAC de Tórax con Contraste", Modalidad = "TAC", PrecioBase = 520, RequiereContraste = true },
            new() { Codigo = "TAC-ABDOMEN", Nombre = "TAC de Abdomen y Pelvis", Modalidad = "TAC", PrecioBase = 550, RequiereContraste = true },
            new() { Codigo = "RMN-CEREBRO", Nombre = "Resonancia Magnética Cerebral", Modalidad = "RMN", PrecioBase = 800, RequiereContraste = false },
            new() { Codigo = "RMN-RODILLA", Nombre = "Resonancia de Rodilla", Modalidad = "RMN", PrecioBase = 750, RequiereContraste = false },
            new() { Codigo = "ECO-ABDOMINAL", Nombre = "Ecografía Abdominal Completa", Modalidad = "Ecografía", PrecioBase = 150, RequiereContraste = false },
            new() { Codigo = "ECO-PELVIS", Nombre = "Ecografía Pélvica", Modalidad = "Ecografía", PrecioBase = 130, RequiereContraste = false },
            new() { Codigo = "ECO-OBSTETRICA", Nombre = "Ecografía Obstétrica", Modalidad = "Ecografía", PrecioBase = 160, RequiereContraste = false },
            new() { Codigo = "MAMOGRAFIA", Nombre = "Mamografía Bilateral", Modalidad = "Mamografía", PrecioBase = 200, RequiereContraste = false },
        };

        // ======================== EQUIPOS ========================
        var equipos = new List<Equipo>
        {
            new() { Codigo = "RX-01", Nombre = "Rayos X Digital - Sala 1", Modalidad = "Rayos X" },
            new() { Codigo = "RX-02", Nombre = "Rayos X Portátil - Emergencia", Modalidad = "Rayos X" },
            new() { Codigo = "TAC-01", Nombre = "TAC Multidetector 64 cortes", Modalidad = "TAC" },
            new() { Codigo = "RMN-01", Nombre = "Resonancia Magnética 1.5T", Modalidad = "RMN" },
            new() { Codigo = "ECO-01", Nombre = "Ecógrafo Philips EPIQ 7", Modalidad = "Ecografía" },
            new() { Codigo = "ECO-02", Nombre = "Ecógrafo portátil GE", Modalidad = "Ecografía" },
            new() { Codigo = "MAMO-01", Nombre = "Mamógrafo Digital Hologic", Modalidad = "Mamografía" },
        };

        // ======================== TECNICOS ========================
        var tecnicos = new List<TecnicoEjecutor>
        {
            new() { Codigo = "TEC-001", Nombre = "Carlos Mamani Quispe", Especialidad = "Rayos X" },
            new() { Codigo = "TEC-002", Nombre = "María Fernández Rojas", Especialidad = "TAC" },
            new() { Codigo = "TEC-003", Nombre = "Jorge Condori Huanca", Especialidad = "RMN" },
            new() { Codigo = "TEC-004", Nombre = "Ana Gutiérrez Paredes", Especialidad = "Ecografía" },
            new() { Codigo = "TEC-005", Nombre = "Roberto Sánchez Flores", Especialidad = "Rayos X" },
            new() { Codigo = "TEC-006", Nombre = "Lucía Torres Vargas", Especialidad = "Mamografía" },
        };

        // ======================== ÓRDENES ========================
        var ordenes = new List<OrdenImagen>
        {
            new() { Codigo = "ORD-2026-001", PacienteId = 1001, MedicoSolicitanteId = 201, FechaSolicitud = DateTime.UtcNow.AddDays(-7), Urgencia = "Normal", Estado = "Activo" },
            new() { Codigo = "ORD-2026-002", PacienteId = 1002, MedicoSolicitanteId = 202, FechaSolicitud = DateTime.UtcNow.AddDays(-5), Urgencia = "Urgente", Estado = "Activo" },
            new() { Codigo = "ORD-2026-003", PacienteId = 1003, MedicoSolicitanteId = 203, FechaSolicitud = DateTime.UtcNow.AddDays(-4), Urgencia = "Normal", Estado = "Activo" },
            new() { Codigo = "ORD-2026-004", PacienteId = 1004, MedicoSolicitanteId = 201, FechaSolicitud = DateTime.UtcNow.AddDays(-3), Urgencia = "Emergencia", Estado = "Activo" },
            new() { Codigo = "ORD-2026-005", PacienteId = 1005, MedicoSolicitanteId = 204, FechaSolicitud = DateTime.UtcNow.AddDays(-2), Urgencia = "Normal", Estado = "Activo" },
            new() { Codigo = "ORD-2026-006", PacienteId = 1006, MedicoSolicitanteId = 205, FechaSolicitud = DateTime.UtcNow.AddDays(-2), Urgencia = "Urgente", Estado = "Activo" },
            new() { Codigo = "ORD-2026-007", PacienteId = 1007, MedicoSolicitanteId = 202, FechaSolicitud = DateTime.UtcNow.AddDays(-1), Urgencia = "Normal", Estado = "Activo" },
            new() { Codigo = "ORD-2026-008", PacienteId = 1008, MedicoSolicitanteId = 206, FechaSolicitud = DateTime.UtcNow.AddDays(-1), Urgencia = "Normal", Estado = "Activo" },
            new() { Codigo = "ORD-2026-009", PacienteId = 1009, MedicoSolicitanteId = 203, FechaSolicitud = DateTime.UtcNow.AddHours(-12), Urgencia = "Emergencia", Estado = "Activo" },
            new() { Codigo = "ORD-2026-010", PacienteId = 1010, MedicoSolicitanteId = 204, FechaSolicitud = DateTime.UtcNow.AddHours(-6), Urgencia = "Normal", Estado = "Activo" },
            new() { Codigo = "ORD-2026-011", PacienteId = 1011, MedicoSolicitanteId = 201, FechaSolicitud = DateTime.UtcNow.AddHours(-3), Urgencia = "Urgente", Estado = "Activo" },
            new() { Codigo = "ORD-2026-012", PacienteId = 1012, MedicoSolicitanteId = 205, FechaSolicitud = DateTime.UtcNow.AddHours(-1), Urgencia = "Normal", Estado = "Activo" },
        };

        // ======================== ESTUDIOS ========================
        var estudios = new List<EstudioRealizado>
        {
            new() { Codigo = "EST-2026-001", OrdenImagenId = 1, TipoEstudioId = 1, TecnicoEjecutorId = 1, EquipoId = 1, FechaHoraInicio = DateTime.UtcNow.AddDays(-7).AddHours(9), FechaHoraFin = DateTime.UtcNow.AddDays(-7).AddHours(9.25), DosisRadiacion = 0.12m, ContrasteAplicado = false, EstadoInforme = "Completado" },
            new() { Codigo = "EST-2026-002", OrdenImagenId = 2, TipoEstudioId = 4, TecnicoEjecutorId = 2, EquipoId = 3, FechaHoraInicio = DateTime.UtcNow.AddDays(-5).AddHours(10), FechaHoraFin = DateTime.UtcNow.AddDays(-5).AddHours(10.5m), DosisRadiacion = 3.20m, ContrasteAplicado = false, EstadoInforme = "Completado" },
            new() { Codigo = "EST-2026-003", OrdenImagenId = 3, TipoEstudioId = 9, TecnicoEjecutorId = 4, EquipoId = 5, FechaHoraInicio = DateTime.UtcNow.AddDays(-4).AddHours(11), FechaHoraFin = DateTime.UtcNow.AddDays(-4).AddHours(11.5m), DosisRadiacion = 0, ContrasteAplicado = false, EstadoInforme = "Completado" },
            new() { Codigo = "EST-2026-004", OrdenImagenId = 4, TipoEstudioId = 6, TecnicoEjecutorId = 2, EquipoId = 3, FechaHoraInicio = DateTime.UtcNow.AddDays(-3).AddHours(14), FechaHoraFin = DateTime.UtcNow.AddDays(-3).AddHours(14.75m), DosisRadiacion = 8.50m, ContrasteAplicado = true, EstadoInforme = "Completado" },
            new() { Codigo = "EST-2026-005", OrdenImagenId = 5, TipoEstudioId = 7, TecnicoEjecutorId = 3, EquipoId = 4, FechaHoraInicio = DateTime.UtcNow.AddDays(-2).AddHours(8), FechaHoraFin = DateTime.UtcNow.AddDays(-2).AddHours(8.5m), DosisRadiacion = 0, ContrasteAplicado = false, EstadoInforme = "Pendiente" },
            new() { Codigo = "EST-2026-006", OrdenImagenId = 6, TipoEstudioId = 5, TecnicoEjecutorId = 2, EquipoId = 3, FechaHoraInicio = DateTime.UtcNow.AddDays(-2).AddHours(10), FechaHoraFin = DateTime.UtcNow.AddDays(-2).AddHours(10.75m), DosisRadiacion = 6.80m, ContrasteAplicado = true, EstadoInforme = "Completado" },
            new() { Codigo = "EST-2026-007", OrdenImagenId = 7, TipoEstudioId = 11, TecnicoEjecutorId = 4, EquipoId = 5, FechaHoraInicio = DateTime.UtcNow.AddDays(-1).AddHours(9), FechaHoraFin = DateTime.UtcNow.AddDays(-1).AddHours(9.5m), DosisRadiacion = 0, ContrasteAplicado = false, EstadoInforme = "Pendiente" },
            new() { Codigo = "EST-2026-008", OrdenImagenId = 8, TipoEstudioId = 12, TecnicoEjecutorId = 6, EquipoId = 7, FechaHoraInicio = DateTime.UtcNow.AddDays(-1).AddHours(11), FechaHoraFin = DateTime.UtcNow.AddDays(-1).AddHours(11.33m), DosisRadiacion = 0.35m, ContrasteAplicado = false, EstadoInforme = "Completado" },
            new() { Codigo = "EST-2026-009", OrdenImagenId = 9, TipoEstudioId = 1, TecnicoEjecutorId = 5, EquipoId = 2, FechaHoraInicio = DateTime.UtcNow.AddHours(-10), FechaHoraFin = DateTime.UtcNow.AddHours(-9.75m), DosisRadiacion = 0.10m, ContrasteAplicado = false, EstadoInforme = "Pendiente" },
            new() { Codigo = "EST-2026-010", OrdenImagenId = 10, TipoEstudioId = 8, TecnicoEjecutorId = 3, EquipoId = 4, FechaHoraInicio = DateTime.UtcNow.AddHours(-4), FechaHoraFin = DateTime.UtcNow.AddHours(-3.5m), DosisRadiacion = 0, ContrasteAplicado = false, EstadoInforme = "Pendiente" },
        };

        // ======================== INFORMES ========================
        var informes = new List<InformeRadiologico>
        {
            new() { Codigo = "INF-2026-001", EstudioRealizadoId = 1, Radiologo = "Dr. Fernando Mamani", Hallazgos = "Campos pulmonares limpios. Silueta cardíaca de tamaño normal. No se observan infiltrados ni consolidaciones.", Diagnostico = "Radiografía de tórax sin hallazgos patológicos.", Observaciones = "Paciente asintomático.", FechaEmision = DateTime.UtcNow.AddDays(-6) },
            new() { Codigo = "INF-2026-002", EstudioRealizadoId = 2, Radiologo = "Dra. Patricia Soto", Hallazgos = "Sin evidencia de lesiones ocupantes de espacio. Sistema ventricular de tamaño normal. No hay desplazamiento de línea media.", Diagnostico = "TAC de cráneo normal.", Observaciones = "", FechaEmision = DateTime.UtcNow.AddDays(-4) },
            new() { Codigo = "INF-2026-003", EstudioRealizadoId = 3, Radiologo = "Dr. Fernando Mamani", Hallazgos = "Hígado de tamaño y ecogenicidad normales. Vesícula biliar sin litiasis. Páncreas, riñones y bazo sin alteraciones ecográficas.", Diagnostico = "Ecografía abdominal normal.", Observaciones = "Paciente en ayunas de 8 horas.", FechaEmision = DateTime.UtcNow.AddDays(-3) },
            new() { Codigo = "INF-2026-004", EstudioRealizadoId = 4, Radiologo = "Dra. Patricia Soto", Hallazgos = "Se observa nódulo pulmonar en lóbulo superior derecho de 12mm con bordes irregulares. Adenopatías hiliares derechas de hasta 15mm.", Diagnostico = "Nódulo pulmonar sospechoso. Se sugiere biopsia por broncoscopia.", Observaciones = "Se notificó al médico tratante Dr. Ramírez.", FechaEmision = DateTime.UtcNow.AddDays(-2) },
            new() { Codigo = "INF-2026-005", EstudioRealizadoId = 6, Radiologo = "Dr. Fernando Mamani", Hallazgos = "Realce adecuado con contraste. No se observan masas ni adenopatías mediastínicas. Derrame pleural bilateral mínimo.", Diagnostico = "TAC de tórax con hallazgos mínimos. Correlacionar con clínica.", Observaciones = "", FechaEmision = DateTime.UtcNow.AddDays(-1) },
            new() { Codigo = "INF-2026-006", EstudioRealizadoId = 8, Radiologo = "Dra. Carmen Ríos", Hallazgos = "Tejido fibroglandular heterogéneo. No se identifican masas, microcalcificaciones ni distorsiones arquitecturales.", Diagnostico = "Mamografía BIRADS 1 - Negativa.", Observaciones = "Control anual de rutina.", FechaEmision = DateTime.UtcNow.AddHours(-12) },
        };

        _context.TiposEstudio.AddRange(tipos);
        _context.Equipos.AddRange(equipos);
        _context.TecnicosEjecutores.AddRange(tecnicos);
        _context.OrdenesImagen.AddRange(ordenes);
        _context.EstudiosRealizados.AddRange(estudios);
        _context.InformesRadiologicos.AddRange(informes);
        _context.SaveChanges();

        return Ok(new
        {
            mensaje = "Datos de demostración cargados exitosamente",
            tiposEstudio = tipos.Count,
            equipos = equipos.Count,
            tecnicos = tecnicos.Count,
            ordenes = ordenes.Count,
            estudios = estudios.Count,
            informes = informes.Count
        });
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Endpoints para integración con otros módulos del hospital.
/// Cada área consume estos endpoints para coordinar con Diagnóstico por Imágenes.
/// </summary>
[ApiController]
[Route("api/integraciones")]
[Tags("6. Integraciones (Compañeros)")]
public class IntegracionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public IntegracionesController(AppDbContext context)
    {
        _context = context;
    }

    // ======================== EMERGENCIAS (Alfredo Herbas) ========================

    /// <summary>
    /// Emergencias prioriza una orden como URGENTE.
    /// Usado por: Emergencias y Triaje (Alfredo Herbas).
    /// PATCH /api/integraciones/emergencias/priorizar/{codigoOrden}
    /// </summary>
    [HttpPatch("emergencias/priorizar/{codigoOrden}")]
    public async Task<ActionResult> PriorizarOrdenEmergencia(string codigoOrden)
    {
        var orden = await _context.OrdenesImagen.FirstOrDefaultAsync(o => o.Codigo == codigoOrden);
        if (orden == null)
            return NotFound($"Orden {codigoOrden} no encontrada.");

        orden.Urgencia = "Emergencia";
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = $"Orden {codigoOrden} priorizada como EMERGENCIA",
            CodigoOrden = codigoOrden,
            Urgencia = orden.Urgencia,
            FechaSolicitud = orden.FechaSolicitud
        });
    }

    /// <summary>
    /// Consulta el estado de una orden urgente.
    /// Usado por: Emergencias para saber si su estudio ya empezó.
    /// </summary>
    [HttpGet("emergencias/estado/{codigoOrden}")]
    public async Task<ActionResult> EstadoOrdenEmergencia(string codigoOrden)
    {
        var orden = await _context.OrdenesImagen
            .Include(o => o.EstudiosRealizados)
            .FirstOrDefaultAsync(o => o.Codigo == codigoOrden);

        if (orden == null)
            return NotFound($"Orden {codigoOrden} no encontrada.");

        var estudio = orden.EstudiosRealizados.FirstOrDefault();

        return Ok(new
        {
            CodigoOrden = codigoOrden,
            Urgencia = orden.Urgencia,
            FechaSolicitud = orden.FechaSolicitud,
            EstudioIniciado = estudio != null,
            CodigoEstudio = estudio?.Codigo,
            EstadoEstudio = estudio?.EstadoInforme ?? "No iniciado",
            Tecnico = estudio != null ? "Asignado" : "Sin asignar"
        });
    }

    // ======================== FARMACIA (Sergio Villarrubia) ========================

    /// <summary>
    /// Notifica que se usó contraste en un estudio (para descuento de inventario).
    /// Usado por: Farmacia Hospitalaria (Sergio Villarrubia).
    /// POST /api/integraciones/farmacia/contraste-usado
    /// </summary>
    [HttpPost("farmacia/contraste-usado")]
    public async Task<ActionResult> NotificarContrasteUsado([FromBody] object request)
    {
        var codigoEstudio = request?.GetType().GetProperty("codigoEstudio")?.GetValue(request)?.ToString();
        if (string.IsNullOrEmpty(codigoEstudio))
            return BadRequest("Se requiere codigoEstudio.");

        var estudio = await _context.EstudiosRealizados
            .FirstOrDefaultAsync(e => e.Codigo == codigoEstudio && e.Estado != "Inactivo");

        if (estudio == null)
            return NotFound($"Estudio {codigoEstudio} no encontrado.");

        estudio.ContrasteAplicado = true;
        await _context.SaveChangesAsync();

        var tipoEstudio = await _context.TiposEstudio.FindAsync(estudio.TipoEstudioId);

        return Ok(new
        {
            mensaje = "Contraste registrado exitosamente",
            CodigoEstudio = codigoEstudio,
            ContrasteAplicado = true,
            TipoEstudio = tipoEstudio?.Nombre,
            FechaRegistro = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Lista estudios que requieren contraste pero aún no lo tienen aplicado.
    /// Usado por: Farmacia para planificar suministro.
    /// </summary>
    [HttpGet("farmacia/contrastes-pendientes")]
    public async Task<ActionResult> ContrastesPendientes()
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    where t.RequiereContraste && !e.ContrasteAplicado && e.Estado != "Inactivo"
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        CodigoOrden = o.Codigo,
                        PacienteId = o.PacienteId,
                        TipoEstudio = t.Nombre,
                        FechaEstudio = e.FechaHoraInicio
                    };

        return Ok(await query.ToListAsync());
    }

    // ======================== FACTURACIÓN (Carlos Balcazar) ========================

    /// <summary>
    /// Lista estudios finalizados listos para facturación.
    /// Usado por: Facturación y Seguros (Carlos Balcazar).
    /// </summary>
    [HttpGet("facturacion/estudios-finalizados")]
    public async Task<ActionResult> EstudiosParaFacturacion([FromQuery] DateTime? fechaDesde, [FromQuery] DateTime? fechaHasta)
    {
        var query = from e in _context.EstudiosRealizados
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    where e.EstadoInforme == "Completado"
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        CodigoOrden = o.Codigo,
                        PacienteId = o.PacienteId,
                        TipoEstudio = t.Nombre,
                        Modalidad = t.Modalidad,
                        PrecioBase = t.PrecioBase,
                        ContrasteAplicado = e.ContrasteAplicado,
                        DosisRadiacion = e.DosisRadiacion,
                        FechaEstudio = e.FechaHoraInicio
                    };

        if (fechaDesde.HasValue)
            query = query.Where(x => x.FechaEstudio >= fechaDesde.Value);

        if (fechaHasta.HasValue)
            query = query.Where(x => x.FechaEstudio <= fechaHasta.Value);

        var resultados = await query.OrderByDescending(x => x.FechaEstudio).ToListAsync();

        return Ok(new
        {
            totalEstudios = resultados.Count,
            montoTotalEstimado = resultados.Sum(x => x.PrecioBase),
            estudios = resultados
        });
    }

    // ======================== ATENCIÓN AL PACIENTE (Enny Lopez) ========================

    /// <summary>
    /// Lista informes firmados y listos para entrega al paciente.
    /// Usado por: Atención al Paciente (Enny Lopez).
    /// </summary>
    [HttpGet("atencion/informes-listos")]
    public async Task<ActionResult> InformesListosEntrega()
    {
        var query = from i in _context.InformesRadiologicos
                    join e in _context.EstudiosRealizados on i.EstudioRealizadoId equals e.Id
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    where i.Estado == "Completado"
                    select new
                    {
                        CodigoInforme = i.Codigo,
                        CodigoOrden = o.Codigo,
                        PacienteId = o.PacienteId,
                        TipoEstudio = t.Nombre,
                        Modalidad = t.Modalidad,
                        Radiologo = i.Radiologo,
                        Diagnostico = i.Diagnostico,
                        FechaEmision = i.FechaEmision,
                        Estado = "Listo para entrega"
                    };

        return Ok(await query.OrderByDescending(x => x.FechaEmision).ToListAsync());
    }

    // ======================== TELEMEDICINA (Ricardo Valencia) ========================

    /// <summary>
    /// Obtiene estudios con informe completo para segunda opinión.
    /// Usado por: Telemedicina (Ricardo Valencia).
    /// </summary>
    [HttpGet("telemedicina/estudios-compartibles")]
    public async Task<ActionResult> EstudiosParaTelemedicina()
    {
        var query = from e in _context.EstudiosRealizados
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    join te in _context.TecnicosEjecutores on e.TecnicoEjecutorId equals te.Id
                    join i in _context.InformesRadiologicos on e.Id equals i.EstudioRealizadoId
                    where e.EstadoInforme == "Completado" && i.Estado == "Completado" && e.Estado != "Inactivo"
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        CodigoOrden = o.Codigo,
                        PacienteId = o.PacienteId,
                        TipoEstudio = t.Nombre,
                        Modalidad = t.Modalidad,
                        Tecnico = te.Nombre,
                        Radiologo = i.Radiologo,
                        Hallazgos = i.Hallazgos,
                        Diagnostico = i.Diagnostico,
                        FechaEstudio = e.FechaHoraInicio,
                        FechaInforme = i.FechaEmision,
                        CompartibleParaSegundaOpinion = true
                    };

        return Ok(await query.OrderByDescending(x => x.FechaEstudio).ToListAsync());
    }

    // ======================== RECURSOS HUMANOS (Rodrigo Porcel) ========================

    /// <summary>
    /// Lista técnicos que ejecutaron estudios en un período.
    /// Usado por: RRHH para validación de credenciales y carga laboral.
    /// </summary>
    [HttpGet("rrhh/tecnicos-activos")]
    public async Task<ActionResult> TecnicosActivos([FromQuery] DateTime? fechaDesde, [FromQuery] DateTime? fechaHasta)
    {
        var query = from e in _context.EstudiosRealizados
                    join te in _context.TecnicosEjecutores on e.TecnicoEjecutorId equals te.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    select new
                    {
                        CodigoTecnico = te.Codigo,
                        NombreTecnico = te.Nombre,
                        Especialidad = te.Especialidad,
                        TipoEstudioRealizado = t.Nombre,
                        FechaEstudio = e.FechaHoraInicio
                    };

        if (fechaDesde.HasValue)
            query = query.Where(x => x.FechaEstudio >= fechaDesde.Value);

        if (fechaHasta.HasValue)
            query = query.Where(x => x.FechaEstudio <= fechaHasta.Value);

        var resultados = await query.OrderByDescending(x => x.FechaEstudio).ToListAsync();

        var resumen = resultados
            .GroupBy(x => new { x.CodigoTecnico, x.NombreTecnico, x.Especialidad })
            .Select(g => new
            {
                CodigoTecnico = g.Key.CodigoTecnico,
                NombreTecnico = g.Key.NombreTecnico,
                Especialidad = g.Key.Especialidad,
                TotalEstudios = g.Count(),
                UltimoEstudio = g.Max(x => x.FechaEstudio)
            })
            .OrderByDescending(x => x.TotalEstudios)
            .ToList();

        return Ok(resumen);
    }

    // ======================== INVENTARIOS (Juan Reyes) ========================

    /// <summary>
    /// Resumen de insumos utilizados (contraste, dosis de radiación).
    /// Usado por: Gestión de Inventarios (Juan Reyes).
    /// </summary>
    [HttpGet("inventarios/resumen-insumos")]
    public async Task<ActionResult> ResumenInsumos([FromQuery] int? anio, [FromQuery] int? mes)
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    where e.Estado != "Inactivo"
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        Modalidad = t.Modalidad,
                        ContrasteAplicado = e.ContrasteAplicado,
                        DosisRadiacion = e.DosisRadiacion,
                        FechaEstudio = e.FechaHoraInicio
                    };

        if (anio.HasValue)
            query = query.Where(x => x.FechaEstudio.Year == anio.Value);

        if (mes.HasValue)
            query = query.Where(x => x.FechaEstudio.Month == mes.Value);

        var resultados = await query.ToListAsync();

        return Ok(new
        {
            totalEstudios = resultados.Count,
            estudiosConContraste = resultados.Count(x => x.ContrasteAplicado),
            estudiosSinContraste = resultados.Count(x => !x.ContrasteAplicado),
            dosisRadiacionTotal = resultados.Sum(x => x.DosisRadiacion),
            dosisRadiacionPromedio = resultados.Any() ? resultados.Average(x => x.DosisRadiacion) : 0,
            desglosePorModalidad = resultados
                .GroupBy(x => x.Modalidad)
                .Select(g => new
                {
                    Modalidad = g.Key,
                    TotalEstudios = g.Count(),
                    ConContraste = g.Count(x => x.ContrasteAplicado),
                    DosisTotal = g.Sum(x => x.DosisRadiacion)
                })
                .ToList()
        });
    }
}

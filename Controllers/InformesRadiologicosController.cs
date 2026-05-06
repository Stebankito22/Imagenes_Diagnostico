using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.DTOs;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Gestión de informes radiológicos y resultados.
/// Usado por: Radiólogos (Joel), Atención al Paciente (Enny) para ver informes firmados.
/// </summary>
[ApiController]
[Route("api/informes")]
[Tags("5. Informes Radiológicos")]
public class InformesRadiologicosController : ControllerBase
{
    private readonly AppDbContext _context;

    public InformesRadiologicosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene todos los estudios e informes de una orden (resultados completos).
    /// Usado por: Consultas Externas, Hospitalización para ver resultados.
    /// </summary>
    [HttpGet("resultado/{codigoOrden}")]
    public async Task<ActionResult<IEnumerable<ResultadoOrdenDto>>> GetResultadosOrden(string codigoOrden)
    {
        var query = from e in _context.EstudiosRealizados
                    where e.Estado != "Inactivo"
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    join te in _context.TecnicosEjecutores on e.TecnicoEjecutorId equals te.Id
                    where o.Codigo == codigoOrden
                    select new { e, o, t, te };

        var estudios = await query.ToListAsync();

        if (!estudios.Any())
            return NotFound("No se encontraron estudios para la orden especificada.");

        var resultados = new List<ResultadoOrdenDto>();

        foreach (var item in estudios)
        {
            var informe = await _context.InformesRadiologicos
                .FirstOrDefaultAsync(i => i.EstudioRealizadoId == item.e.Id && i.Estado != "Eliminado");

            resultados.Add(new ResultadoOrdenDto
            {
                CodigoEstudio = item.e.Codigo,
                CodigoOrden = item.o.Codigo,
                PacienteId = item.o.PacienteId,
                TipoEstudio = item.t.Nombre,
                Modalidad = item.t.Modalidad,
                Tecnico = item.te.Nombre,
                Radiologo = informe?.Radiologo ?? "Sin asignar",
                Hallazgos = informe?.Hallazgos ?? "Pendiente de informe",
                Diagnostico = informe?.Diagnostico ?? "Pendiente de informe",
                Observaciones = informe?.Observaciones ?? "",
                FechaEstudio = item.e.FechaHoraInicio,
                FechaEmision = informe?.FechaEmision ?? DateTime.MinValue
            });
        }

        return Ok(resultados);
    }

    /// <summary>
    /// Lista órdenes con estudios o informes pendientes.
    /// Usado por: Tu equipo para ver qué falta por informar.
    /// </summary>
    [HttpGet("pendientes")]
    public async Task<ActionResult<IEnumerable<OrdenExamenPendienteDto>>> GetOrdenExamenPendiente()
    {
        var query = from o in _context.OrdenesImagen
                    where o.Estado == "Activo"
                    join e in _context.EstudiosRealizados
                        on o.Id equals e.OrdenImagenId into estudiosGroup
                    from e in estudiosGroup.DefaultIfEmpty()
                    join t in _context.TiposEstudio
                        on e.TipoEstudioId equals t.Id into tipoGroup
                    from t in tipoGroup.DefaultIfEmpty()
                    join i in _context.InformesRadiologicos
                        on e.Id equals i.EstudioRealizadoId into informeGroup
                    from i in informeGroup.Where(x => x.Estado != "Eliminado").DefaultIfEmpty()
                    where e.Id == 0 || e.EstadoInforme == "Pendiente" || (e.Id != 0 && i == null)
                    group new { o, e, t, i } by new { o.Codigo, o.PacienteId, o.FechaSolicitud, o.Urgencia } into g
                    select new OrdenExamenPendienteDto
                    {
                        CodigoOrden = g.Key.Codigo,
                        PacienteId = g.Key.PacienteId,
                        TipoEstudioSolicitado = g.Select(x => x.t != null ? x.t.Nombre : "Sin estudio asignado").FirstOrDefault(),
                        Urgencia = g.Key.Urgencia,
                        FechaSolicitud = g.Key.FechaSolicitud,
                        EstadoEstudio = g.Any(x => x.e.Id != 0) ? "Realizado" : "No realizado",
                        EstadoInforme = g.Any(x => x.i != null && x.i.Estado != "Eliminado") ? "Completado" : "Pendiente"
                    };

        var pendientes = await query
            .OrderByDescending(p => p.FechaSolicitud)
            .ToListAsync();

        return Ok(pendientes);
    }

    /// <summary>
    /// Crea un informe radiológico y marca el estudio como completado.
    /// Usado por: Radiólogos (Joel) para firmar informes.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CrearInforme(InformeRadiologicoDto dto)
    {
        var estudio = await _context.EstudiosRealizados
            .FirstOrDefaultAsync(e => e.Codigo == dto.CodigoEstudio && e.Estado != "Inactivo");

        if (estudio == null)
            return BadRequest("El estudio no existe o esta inactivo.");

        var informeExistente = await _context.InformesRadiologicos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(i => i.Codigo == dto.Codigo);

        if (informeExistente != null)
            return Conflict("Ya existe un informe con ese código.");

        var informe = new InformeRadiologico
        {
            Codigo = dto.Codigo,
            EstudioRealizadoId = estudio.Id,
            Radiologo = dto.Radiologo,
            Hallazgos = dto.Hallazgos,
            Diagnostico = dto.Diagnostico,
            Observaciones = dto.Observaciones,
            FechaEmision = DateTime.SpecifyKind(dto.FechaEmision, DateTimeKind.Utc),
            Estado = "Completado"
        };

        estudio.EstadoInforme = "Completado";

        _context.InformesRadiologicos.Add(informe);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInformeById), new { codigo = informe.Codigo }, null);
    }

    /// <summary>
    /// Obtiene un informe por su código.
    /// </summary>
    [HttpGet("{codigo}")]
    public async Task<ActionResult<InformeRadiologicoDto>> GetInformeById(string codigo)
    {
        var informe = await _context.InformesRadiologicos
            .FirstOrDefaultAsync(i => i.Codigo == codigo && i.Estado != "Eliminado");

        if (informe == null)
            return NotFound();

        return new InformeRadiologicoDto
        {
            Codigo = informe.Codigo,
            CodigoEstudio = informe.EstudioRealizado?.Codigo ?? "",
            Radiologo = informe.Radiologo,
            Hallazgos = informe.Hallazgos,
            Diagnostico = informe.Diagnostico,
            Observaciones = informe.Observaciones,
            FechaEmision = informe.FechaEmision
        };
    }

    /// <summary>
    /// Actualiza un informe existente.
    /// </summary>
    [HttpPut("{codigo}")]
    public async Task<ActionResult> ActualizarInforme(string codigo, InformeRadiologicoDto dto)
    {
        var informe = await _context.InformesRadiologicos
            .FirstOrDefaultAsync(i => i.Codigo == codigo && i.Estado != "Eliminado");

        if (informe == null)
            return NotFound();

        informe.Radiologo = dto.Radiologo;
        informe.Hallazgos = dto.Hallazgos;
        informe.Diagnostico = dto.Diagnostico;
        informe.Observaciones = dto.Observaciones;
        informe.FechaEmision = DateTime.SpecifyKind(dto.FechaEmision, DateTimeKind.Utc);
        informe.Estado = "Completado";

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Elimina un informe (borrado lógico).
    /// </summary>
    [HttpDelete("{codigo}")]
    public async Task<ActionResult> EliminarInforme(string codigo)
    {
        var informe = await _context.InformesRadiologicos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(i => i.Codigo == codigo);

        if (informe == null)
            return NotFound();

        informe.Estado = "Eliminado";
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Informes firmados y listos para que el paciente los recoja.
    /// Usado por: Atención al Paciente (Enny).
    /// </summary>
    [HttpGet("firmados")]
    public async Task<ActionResult<IEnumerable<object>>> GetInformesFirmados()
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
                        Radiologo = i.Radiologo,
                        Diagnostico = i.Diagnostico,
                        FechaEmision = i.FechaEmision
                    };

        return Ok(await query.OrderByDescending(x => x.FechaEmision).ToListAsync());
    }
}

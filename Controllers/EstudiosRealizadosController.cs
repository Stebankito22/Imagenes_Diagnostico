using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.DTOs;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Gestión de estudios realizados y estadísticas.
/// Usado por: Tu equipo de Imágenes, Facturación (Carlos), Farmacia (Sergio).
/// </summary>
[ApiController]
[Route("api/estudiosrealizados")]
[Tags("3. Estudios Realizados")]
public class EstudiosRealizadosController : ControllerBase
{
    private readonly AppDbContext _context;

    public EstudiosRealizadosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todos los estudios realizados con información completa.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EstudioRealizadoDto>>> GetAll()
    {
        var query = from e in _context.EstudiosRealizados
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    join eq in _context.Equipos on e.EquipoId equals eq.Id
                    join te in _context.TecnicosEjecutores on e.TecnicoEjecutorId equals te.Id
                    select new EstudioRealizadoDto
                    {
                        Codigo = e.Codigo,
                        CodigoOrden = o.Codigo,
                        CodigoTipoEstudio = t.Codigo,
                        CodigoTecnico = te.Codigo,
                        CodigoEquipo = eq.Codigo,
                        FechaHoraInicio = e.FechaHoraInicio,
                        FechaHoraFin = e.FechaHoraFin,
                        DosisRadiacion = e.DosisRadiacion,
                        ContrasteAplicado = e.ContrasteAplicado,
                        EstadoInforme = e.EstadoInforme
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Obtiene un estudio por su código.
    /// </summary>
    [HttpGet("{codigo}")]
    public async Task<ActionResult<EstudioRealizadoDto>> GetByCodigo(string codigo)
    {
        var query = from e in _context.EstudiosRealizados
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    join eq in _context.Equipos on e.EquipoId equals eq.Id
                    join te in _context.TecnicosEjecutores on e.TecnicoEjecutorId equals te.Id
                    where e.Codigo == codigo
                    select new EstudioRealizadoDto
                    {
                        Codigo = e.Codigo,
                        CodigoOrden = o.Codigo,
                        CodigoTipoEstudio = t.Codigo,
                        CodigoTecnico = te.Codigo,
                        CodigoEquipo = eq.Codigo,
                        FechaHoraInicio = e.FechaHoraInicio,
                        FechaHoraFin = e.FechaHoraFin,
                        DosisRadiacion = e.DosisRadiacion,
                        ContrasteAplicado = e.ContrasteAplicado,
                        EstadoInforme = e.EstadoInforme
                    };
        var estudio = await query.FirstOrDefaultAsync();
        if (estudio == null) return NotFound();
        return Ok(estudio);
    }

    /// <summary>
    /// Registra un nuevo estudio realizado.
    /// Usado por: Técnicos radiólogos.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create(EstudioRealizadoDto dto)
    {
        var orden = await _context.OrdenesImagen.FirstOrDefaultAsync(o => o.Codigo == dto.CodigoOrden);
        var tipo = await _context.TiposEstudio.FirstOrDefaultAsync(t => t.Codigo == dto.CodigoTipoEstudio);
        var tecnico = await _context.TecnicosEjecutores.FirstOrDefaultAsync(t => t.Codigo == dto.CodigoTecnico);
        var equipo = await _context.Equipos.FirstOrDefaultAsync(e => e.Codigo == dto.CodigoEquipo);

        if (orden == null || tipo == null || tecnico == null || equipo == null)
            return BadRequest("Orden, Tipo de estudio, Tecnico o Equipo no existen o están inactivos.");

        var estudio = new EstudioRealizado
        {
            Codigo = dto.Codigo,
            OrdenImagenId = orden.Id,
            TipoEstudioId = tipo.Id,
            TecnicoEjecutorId = tecnico.Id,
            EquipoId = equipo.Id,
            FechaHoraInicio = DateTime.SpecifyKind(dto.FechaHoraInicio, DateTimeKind.Utc),
            FechaHoraFin = DateTime.SpecifyKind(dto.FechaHoraFin, DateTimeKind.Utc),
            DosisRadiacion = dto.DosisRadiacion,
            ContrasteAplicado = dto.ContrasteAplicado,
            EstadoInforme = dto.EstadoInforme
        };
        _context.EstudiosRealizados.Add(estudio);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            if (Exists(dto.Codigo)) return Conflict();
            throw;
        }
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = estudio.Codigo }, null);
    }

    /// <summary>
    /// Actualiza un estudio existente.
    /// </summary>
    [HttpPut("{codigo}")]
    public async Task<ActionResult> Update(string codigo, EstudioRealizadoDto dto)
    {
        var estudio = await _context.EstudiosRealizados.FirstOrDefaultAsync(e => e.Codigo == codigo);
        if (estudio == null) return NotFound();

        var orden = await _context.OrdenesImagen.FirstOrDefaultAsync(o => o.Codigo == dto.CodigoOrden);
        var tipo = await _context.TiposEstudio.FirstOrDefaultAsync(t => t.Codigo == dto.CodigoTipoEstudio);
        var tecnico = await _context.TecnicosEjecutores.FirstOrDefaultAsync(t => t.Codigo == dto.CodigoTecnico);
        var equipo = await _context.Equipos.FirstOrDefaultAsync(e => e.Codigo == dto.CodigoEquipo);

        if (orden == null || tipo == null || tecnico == null || equipo == null)
            return BadRequest("Orden, Tipo de estudio, Tecnico o Equipo no existen o están inactivos.");

        estudio.OrdenImagenId = orden.Id;
        estudio.TipoEstudioId = tipo.Id;
        estudio.TecnicoEjecutorId = tecnico.Id;
        estudio.EquipoId = equipo.Id;
        estudio.FechaHoraInicio = DateTime.SpecifyKind(dto.FechaHoraInicio, DateTimeKind.Utc);
        estudio.FechaHoraFin = DateTime.SpecifyKind(dto.FechaHoraFin, DateTimeKind.Utc);
        estudio.DosisRadiacion = dto.DosisRadiacion;
        estudio.ContrasteAplicado = dto.ContrasteAplicado;
        estudio.EstadoInforme = dto.EstadoInforme;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Elimina un estudio (borrado lógico).
    /// </summary>
    [HttpDelete("{codigo}")]
    public async Task<ActionResult> Delete(string codigo)
    {
        var estudio = await _context.EstudiosRealizados.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.Codigo == codigo);
        if (estudio == null) return NotFound();
        estudio.Estado = "Inactivo";
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ======================== ESTADÍSTICAS Y REPORTES ========================

    /// <summary>
    /// Cantidad de estudios por modalidad.
    /// Usado por: Dashboard de gestión.
    /// </summary>
    [HttpGet("contar-por-modalidad")]
    public async Task<ActionResult<IEnumerable<object>>> ContarPorModalidad()
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    group e by t.Modalidad into g
                    select new { Modalidad = g.Key, Cantidad = g.Count() };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Ingreso total estimado por modalidad.
    /// Usado por: Facturación (Carlos), Dashboard.
    /// </summary>
    [HttpGet("suma-precios-por-modalidad")]
    public async Task<ActionResult<IEnumerable<object>>> SumaPreciosPorModalidad()
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    group t by t.Modalidad into g
                    select new { Modalidad = g.Key, IngresoTotalEstimado = g.Sum(x => x.PrecioBase) };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Estudios por nivel de urgencia.
    /// Usado por: Emergencias (Alfredo), Dashboard.
    /// </summary>
    [HttpGet("por-urgencia")]
    public async Task<ActionResult<IEnumerable<object>>> EstudiosPorUrgencia()
    {
        var query = from e in _context.EstudiosRealizados
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    group o by o.Urgencia into g
                    select new { Urgencia = g.Key, Cantidad = g.Count() };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Producción mensual de estudios por modalidad.
    /// Usado por: Dashboard de gestión.
    /// </summary>
    [HttpGet("produccion-mensual")]
    public async Task<ActionResult<IEnumerable<object>>> ProduccionMensual([FromQuery] int anio, [FromQuery] int mes)
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    where e.FechaHoraInicio.Year == anio && e.FechaHoraInicio.Month == mes
                    group e by t.Modalidad into g
                    select new { Modalidad = g.Key, TotalEstudios = g.Count() };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Tiempo promedio por tipo de estudio.
    /// Usado por: Dashboard de gestión.
    /// </summary>
    [HttpGet("tiempo-promedio")]
    public async Task<ActionResult<IEnumerable<object>>> TiempoPromedioPorTipo()
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    select new
                    {
                        TipoEstudio = t.Nombre,
                        FechaInicio = e.FechaHoraInicio,
                        FechaFin = e.FechaHoraFin
                    };

        var estudios = await query.ToListAsync();

        var resultado = from e in estudios
                        group e by e.TipoEstudio into g
                        select new
                        {
                            TipoEstudio = g.Key,
                            TiempoPromedioSegundos = g.Average(x => (x.FechaFin - x.FechaInicio).TotalSeconds)
                        };

        return Ok(resultado.ToList());
    }

    /// <summary>
    /// Equipos más utilizados en un rango de fechas.
    /// Usado por: Dashboard de gestión, Inventarios.
    /// </summary>
    [HttpGet("equipos-top")]
    public async Task<ActionResult<IEnumerable<object>>> EquiposTop([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        var inicio = DateTime.SpecifyKind(fechaInicio, DateTimeKind.Utc);
        var fin = DateTime.SpecifyKind(fechaFin, DateTimeKind.Utc);
        var query = from e in _context.EstudiosRealizados
                    join eq in _context.Equipos on e.EquipoId equals eq.Id
                    where e.FechaHoraInicio >= inicio && e.FechaHoraInicio <= fin
                    group new { e, eq } by eq.Nombre into g
                    orderby g.Count() descending
                    select new
                    {
                        Equipo = g.Key,
                        TotalEstudios = g.Count()
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Dosis acumulada de radiación por paciente.
    /// Usado por: Seguridad del paciente, Dashboard.
    /// </summary>
    [HttpGet("dosis-acumulada")]
    public async Task<ActionResult<IEnumerable<object>>> DosisAcumuladaPorPaciente()
    {
        var query = from e in _context.EstudiosRealizados
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    group e by o.PacienteId into g
                    select new
                    {
                        PacienteId = g.Key,
                        DosisTotal = g.Sum(x => x.DosisRadiacion)
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Ranking de tipos de estudio más solicitados.
    /// Usado por: Dashboard de gestión.
    /// </summary>
    [HttpGet("ranking-tipos")]
    public async Task<ActionResult<IEnumerable<object>>> RankingTiposEstudio()
    {
        var estudios = await _context.EstudiosRealizados.ToListAsync();
        var tipos = await _context.TiposEstudio.ToDictionaryAsync(t => t.Id, t => t.Nombre);

        var resultado = estudios
            .GroupBy(e => e.TipoEstudioId)
            .OrderByDescending(g => g.Count())
            .Select(g => new
            {
                TipoEstudio = tipos.ContainsKey(g.Key) ? tipos[g.Key] : "Desconocido",
                Cantidad = g.Count()
            });

        return Ok(resultado.ToList());
    }

    // ======================== OPERATIVOS ========================

    /// <summary>
    /// Estudios con informe pendiente.
    /// Usado por: Radiólogos (Joel) para saber qué informar.
    /// </summary>
    [HttpGet("pendientes-informe")]
    public async Task<ActionResult<IEnumerable<object>>> EstudiosPendientesInforme()
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    where e.EstadoInforme == "Pendiente"
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        FechaInicio = e.FechaHoraInicio,
                        TipoEstudio = t.Nombre
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Estudios realizados hoy por un técnico específico.
    /// Usado por: Técnicos para ver su carga de trabajo del día.
    /// </summary>
    [HttpGet("hoy-por-tecnico/{codigoTecnico}")]
    public async Task<ActionResult<IEnumerable<object>>> EstudiosHoyPorTecnico(string codigoTecnico)
    {
        var hoy = DateTime.SpecifyKind(DateTime.Today, DateTimeKind.Utc);
        var query = from e in _context.EstudiosRealizados
                    join te in _context.TecnicosEjecutores on e.TecnicoEjecutorId equals te.Id
                    where te.Codigo == codigoTecnico && e.FechaHoraInicio.Date == hoy.Date
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        FechaInicio = e.FechaHoraInicio,
                        TipoEstudio = e.TipoEstudio.Nombre
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Estudios que requieren contraste pero no lo tienen aplicado.
    /// Usado por: Farmacia (Sergio) para verificar suministro.
    /// </summary>
    [HttpGet("contraste-pendiente")]
    public async Task<ActionResult<IEnumerable<object>>> ContrastePendiente()
    {
        var query = from e in _context.EstudiosRealizados
                    join t in _context.TiposEstudio on e.TipoEstudioId equals t.Id
                    join o in _context.OrdenesImagen on e.OrdenImagenId equals o.Id
                    where t.RequiereContraste && !e.ContrasteAplicado
                    select new
                    {
                        CodigoEstudio = e.Codigo,
                        PacienteId = o.PacienteId,
                        TipoEstudio = t.Nombre
                    };
        return Ok(await query.ToListAsync());
    }

    private bool Exists(string codigo)
    {
        return _context.EstudiosRealizados.Any(e => e.Codigo == codigo);
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.DTOs;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Gestión de órdenes médicas de imagen.
/// Usado por: Consultas Externas (Wilson), Hospitalización (Juan), Emergencias (Alfredo)
/// </summary>
[ApiController]
[Route("api/ordenesimagen")]
[Tags("1. Órdenes de Imagen")]
public class OrdenesImagenController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdenesImagenController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todas las órdenes de imagen activas.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrdenImagenDto>>> GetAll()
    {
        var query = from o in _context.OrdenesImagen
                    select new OrdenImagenDto
                    {
                        Codigo = o.Codigo,
                        PacienteId = o.PacienteId,
                        MedicoSolicitanteId = o.MedicoSolicitanteId,
                        FechaSolicitud = o.FechaSolicitud,
                        Urgencia = o.Urgencia
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Obtiene una orden por su código.
    /// </summary>
    [HttpGet("{codigo}")]
    public async Task<ActionResult<OrdenImagenDto>> GetByCodigo(string codigo)
    {
        var query = from o in _context.OrdenesImagen
                    where o.Codigo == codigo
                    select new OrdenImagenDto
                    {
                        Codigo = o.Codigo,
                        PacienteId = o.PacienteId,
                        MedicoSolicitanteId = o.MedicoSolicitanteId,
                        FechaSolicitud = o.FechaSolicitud,
                        Urgencia = o.Urgencia
                    };
        var orden = await query.FirstOrDefaultAsync();
        if (orden == null) return NotFound();
        return Ok(orden);
    }

    /// <summary>
    /// Crea una nueva orden de imagen.
    /// Usado por: Consultas Externas, Hospitalización.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create(OrdenImagenDto dto)
    {
        var ordenExistente = await _context.OrdenesImagen.IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Codigo == dto.Codigo);
        if (ordenExistente != null)
            return Conflict("Ya existe una orden con ese código.");

        var orden = new OrdenImagen
        {
            Codigo = dto.Codigo,
            PacienteId = dto.PacienteId,
            MedicoSolicitanteId = dto.MedicoSolicitanteId,
            FechaSolicitud = DateTime.SpecifyKind(dto.FechaSolicitud, DateTimeKind.Utc),
            Urgencia = dto.Urgencia
        };
        _context.OrdenesImagen.Add(orden);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = orden.Codigo }, null);
    }

    /// <summary>
    /// Actualiza una orden existente.
    /// </summary>
    [HttpPut("{codigo}")]
    public async Task<ActionResult> Update(string codigo, OrdenImagenDto dto)
    {
        var orden = await _context.OrdenesImagen.FirstOrDefaultAsync(o => o.Codigo == codigo);
        if (orden == null) return NotFound();
        orden.PacienteId = dto.PacienteId;
        orden.MedicoSolicitanteId = dto.MedicoSolicitanteId;
        orden.FechaSolicitud = DateTime.SpecifyKind(dto.FechaSolicitud, DateTimeKind.Utc);
        orden.Urgencia = dto.Urgencia;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Elimina una orden (borrado lógico).
    /// </summary>
    [HttpDelete("{codigo}")]
    public async Task<ActionResult> Delete(string codigo)
    {
        var orden = await _context.OrdenesImagen.IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Codigo == codigo);
        if (orden == null) return NotFound();
        orden.Estado = "Inactivo";
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Ordenes que aún no tienen ningún estudio asignado.
    /// Usado por: Tu equipo para ver qué órdenes faltan ejecutar.
    /// </summary>
    [HttpGet("sin-estudio")]
    public async Task<ActionResult<IEnumerable<object>>> OrdenesSinEstudio()
    {
        var query = from o in _context.OrdenesImagen
                    where !(from e in _context.EstudiosRealizados select e.OrdenImagenId).Contains(o.Id)
                    select new
                    {
                        CodigoOrden = o.Codigo,
                        FechaSolicitud = o.FechaSolicitud,
                        Urgencia = o.Urgencia
                    };
        return Ok(await query.ToListAsync());
    }

    /// <summary>
    /// Crea una orden completa con tipo de estudio e indicación clínica.
    /// Usado por: Consultas Externas (Wilson), Hospitalización (Juan).
    /// </summary>
    [HttpPost("orden-examen")]
    public async Task<ActionResult> PostOrdenExamen(OrdenExamenDto dto)
    {
        var tipoEstudio = await _context.TiposEstudio.FirstOrDefaultAsync(t => t.Codigo == dto.CodigoTipoEstudio);
        if (tipoEstudio == null)
            return BadRequest("El tipo de estudio solicitado no existe.");

        var ordenExistente = await _context.OrdenesImagen.IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Codigo == dto.Codigo);
        if (ordenExistente != null)
            return Conflict("Ya existe una orden con ese código.");

        var orden = new OrdenImagen
        {
            Codigo = dto.Codigo,
            PacienteId = dto.PacienteId,
            MedicoSolicitanteId = dto.MedicoSolicitanteId,
            FechaSolicitud = DateTime.SpecifyKind(dto.FechaSolicitud, DateTimeKind.Utc),
            Urgencia = dto.Urgencia,
            Estado = "Activo"
        };

        _context.OrdenesImagen.Add(orden);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrdenById), new { codigo = orden.Codigo }, new
        {
            orden.Codigo,
            orden.PacienteId,
            orden.FechaSolicitud,
            TipoEstudio = tipoEstudio.Nombre,
            RequiereContraste = tipoEstudio.RequiereContraste
        });
    }

    /// <summary>
    /// Obtiene una orden con información completa del tipo de estudio solicitado.
    /// Usado por: Consultas Externas, Hospitalización para verificar estado de su orden.
    /// </summary>
    [HttpGet("orden-examen/{codigo}")]
    public async Task<ActionResult<OrdenExamenDto>> GetOrdenById(string codigo)
    {
        var orden = await _context.OrdenesImagen
            .Include(o => o.EstudiosRealizados)
                .ThenInclude(e => e.TipoEstudio)
            .FirstOrDefaultAsync(o => o.Codigo == codigo);

        if (orden == null)
            return NotFound();

        var tipoSolicitado = orden.EstudiosRealizados.FirstOrDefault()?.TipoEstudio;

        return new OrdenExamenDto
        {
            Codigo = orden.Codigo,
            PacienteId = orden.PacienteId,
            MedicoSolicitanteId = orden.MedicoSolicitanteId,
            FechaSolicitud = orden.FechaSolicitud,
            Urgencia = orden.Urgencia,
            CodigoTipoEstudio = tipoSolicitado?.Codigo ?? "",
            TipoEstudio = tipoSolicitado?.Nombre ?? ""
        };
    }
}

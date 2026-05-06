using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.DTOs;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Catálogo de tipos de estudio (Rayos X, TAC, Resonancia, Ecografía, etc.).
/// </summary>
[ApiController]
[Route("api/tiposestudio")]
[Tags("2. Tipos de Estudio")]
public class TiposEstudioController : ControllerBase
{
    private readonly AppDbContext _context;

    public TiposEstudioController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TipoEstudioDto>>> GetAll()
    {
        var query = from t in _context.TiposEstudio
                    select new TipoEstudioDto
                    {
                        Codigo = t.Codigo,
                        Nombre = t.Nombre,
                        Modalidad = t.Modalidad,
                        PrecioBase = t.PrecioBase
                    };
        return Ok(await query.ToListAsync());
    }

    [HttpGet("{codigo}")]
    public async Task<ActionResult<TipoEstudioDto>> GetByCodigo(string codigo)
    {
        var query = from t in _context.TiposEstudio
                    where t.Codigo == codigo
                    select new TipoEstudioDto
                    {
                        Codigo = t.Codigo,
                        Nombre = t.Nombre,
                        Modalidad = t.Modalidad,
                        PrecioBase = t.PrecioBase
                    };
        var tipo = await query.FirstOrDefaultAsync();
        if (tipo == null) return NotFound();
        return Ok(tipo);
    }

    [HttpPost]
    public async Task<ActionResult> Create(TipoEstudioDto dto)
    {
        var tipo = new TipoEstudio
        {
            Codigo = dto.Codigo,
            Nombre = dto.Nombre,
            Modalidad = dto.Modalidad,
            PrecioBase = dto.PrecioBase
        };
        _context.TiposEstudio.Add(tipo);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            if (Exists(dto.Codigo)) return Conflict();
            throw;
        }
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = tipo.Codigo }, null);
    }

    [HttpPut("{codigo}")]
    public async Task<ActionResult> Update(string codigo, TipoEstudioDto dto)
    {
        var tipo = await _context.TiposEstudio.FirstOrDefaultAsync(t => t.Codigo == codigo);
        if (tipo == null) return NotFound();
        tipo.Nombre = dto.Nombre;
        tipo.Modalidad = dto.Modalidad;
        tipo.PrecioBase = dto.PrecioBase;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{codigo}")]
    public async Task<ActionResult> Delete(string codigo)
    {
        var tipo = await _context.TiposEstudio.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Codigo == codigo);
        if (tipo == null) return NotFound();
        tipo.Estado = "Inactivo";
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool Exists(string codigo)
    {
        return _context.TiposEstudio.Any(t => t.Codigo == codigo);
    }
}
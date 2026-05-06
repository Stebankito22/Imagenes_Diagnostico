using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.DTOs;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Catálogo de técnicos ejecutores (personal que realiza los estudios).
/// </summary>
[ApiController]
[Route("api/tecnicos")]
[Tags("4. Técnicos Ejecutores")]
public class TecnicosEjecutoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public TecnicosEjecutoresController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TecnicoEjecutorDto>>> GetAll()
    {
        var query = from t in _context.TecnicosEjecutores
                    select new TecnicoEjecutorDto
                    {
                        Codigo = t.Codigo,
                        Nombre = t.Nombre,
                        Especialidad = t.Especialidad
                    };
        return Ok(await query.ToListAsync());
    }

    [HttpGet("{codigo}")]
    public async Task<ActionResult<TecnicoEjecutorDto>> GetByCodigo(string codigo)
    {
        var query = from t in _context.TecnicosEjecutores
                    where t.Codigo == codigo
                    select new TecnicoEjecutorDto
                    {
                        Codigo = t.Codigo,
                        Nombre = t.Nombre,
                        Especialidad = t.Especialidad
                    };
        var tecnico = await query.FirstOrDefaultAsync();
        if (tecnico == null) return NotFound();
        return Ok(tecnico);
    }

    [HttpPost]
    public async Task<ActionResult> Create(TecnicoEjecutorDto dto)
    {
        var tecnico = new TecnicoEjecutor
        {
            Codigo = dto.Codigo,
            Nombre = dto.Nombre,
            Especialidad = dto.Especialidad
        };
        _context.TecnicosEjecutores.Add(tecnico);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            if (Exists(dto.Codigo)) return Conflict();
            throw;
        }
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = tecnico.Codigo }, null);
    }

    private bool Exists(string codigo)
    {
        return _context.TecnicosEjecutores.Any(t => t.Codigo == codigo);
    }
}

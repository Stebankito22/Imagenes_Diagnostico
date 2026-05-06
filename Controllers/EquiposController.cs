using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using ImagenDiagnostico.DTOs;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Controllers;

/// <summary>
/// Catálogo de equipos de imagen (Rayos X, TAC, Resonancia, etc.).
/// </summary>
[ApiController]
[Route("api/equipos")]
[Tags("4. Equipos")]
public class EquiposController : ControllerBase
{
    private readonly AppDbContext _context;

    public EquiposController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EquipoDto>>> GetAll()
    {
        var query = from e in _context.Equipos
                    select new EquipoDto
                    {
                        Codigo = e.Codigo,
                        Nombre = e.Nombre,
                        Modalidad = e.Modalidad
                    };
        return Ok(await query.ToListAsync());
    }

    [HttpGet("{codigo}")]
    public async Task<ActionResult<EquipoDto>> GetByCodigo(string codigo)
    {
        var query = from e in _context.Equipos
                    where e.Codigo == codigo
                    select new EquipoDto
                    {
                        Codigo = e.Codigo,
                        Nombre = e.Nombre,
                        Modalidad = e.Modalidad
                    };
        var equipo = await query.FirstOrDefaultAsync();
        if (equipo == null) return NotFound();
        return Ok(equipo);
    }

    [HttpPost]
    public async Task<ActionResult> Create(EquipoDto dto)
    {
        var equipo = new Equipo
        {
            Codigo = dto.Codigo,
            Nombre = dto.Nombre,
            Modalidad = dto.Modalidad
        };
        _context.Equipos.Add(equipo);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            if (Exists(dto.Codigo)) return Conflict();
            throw;
        }
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = equipo.Codigo }, null);
    }

    private bool Exists(string codigo)
    {
        return _context.Equipos.Any(e => e.Codigo == codigo);
    }
}

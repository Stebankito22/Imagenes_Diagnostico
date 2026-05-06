namespace ImagenDiagnostico.Models;

public class EstudioRealizado
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public int OrdenImagenId { get; set; }
    public int TipoEstudioId { get; set; }
    public int TecnicoEjecutorId { get; set; }
    public int EquipoId { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public decimal DosisRadiacion { get; set; }
    public bool ContrasteAplicado { get; set; }
    public string EstadoInforme { get; set; } = "Pendiente";
    public string Estado { get; set; } = "Activo";
    public OrdenImagen? OrdenImagen { get; set; }
    public TipoEstudio? TipoEstudio { get; set; }
    public Equipo? Equipo { get; set; }
    public TecnicoEjecutor? TecnicoEjecutor { get; set; }
    public ICollection<InformeRadiologico> InformesRadiologicos { get; set; } = new List<InformeRadiologico>();
}
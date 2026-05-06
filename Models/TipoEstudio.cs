namespace ImagenDiagnostico.Models;

public class TipoEstudio
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Modalidad { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public bool RequiereContraste { get; set; }
    public string Estado { get; set; } = "Activo";
    public ICollection<EstudioRealizado> EstudiosRealizados { get; set; } = new List<EstudioRealizado>();
}
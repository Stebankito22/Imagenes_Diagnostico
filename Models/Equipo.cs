namespace ImagenDiagnostico.Models;

public class Equipo
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Modalidad { get; set; } = string.Empty;
    public string Estado { get; set; } = "Activo";
    public ICollection<EstudioRealizado> EstudiosRealizados { get; set; } = new List<EstudioRealizado>();
}

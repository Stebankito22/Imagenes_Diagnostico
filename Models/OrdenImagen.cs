namespace ImagenDiagnostico.Models;

public class OrdenImagen
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public int PacienteId { get; set; }
    public int MedicoSolicitanteId { get; set; }
    public DateTime FechaSolicitud { get; set; }
    public string Urgencia { get; set; } = string.Empty;
    public string Estado { get; set; } = "Activo";
    public ICollection<EstudioRealizado> EstudiosRealizados { get; set; } = new List<EstudioRealizado>();
}
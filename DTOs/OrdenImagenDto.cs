namespace ImagenDiagnostico.DTOs;

public class OrdenImagenDto
{
    public string Codigo { get; set; } = string.Empty;
    public int PacienteId { get; set; }
    public int MedicoSolicitanteId { get; set; }
    public DateTime FechaSolicitud { get; set; }
    public string Urgencia { get; set; } = string.Empty;
}
namespace ImagenDiagnostico.DTOs;

public class TipoEstudioDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Modalidad { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
}
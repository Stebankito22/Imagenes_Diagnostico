namespace ImagenDiagnostico.Models;

public class InformeRadiologico
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public int EstudioRealizadoId { get; set; }
    public string Radiologo { get; set; } = string.Empty;
    public string Hallazgos { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public EstudioRealizado? EstudioRealizado { get; set; }
}

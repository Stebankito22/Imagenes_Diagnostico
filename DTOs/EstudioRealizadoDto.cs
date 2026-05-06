namespace ImagenDiagnostico.DTOs;

public class EstudioRealizadoDto
{
    public string Codigo { get; set; } = string.Empty;
    public string CodigoOrden { get; set; } = string.Empty;
    public string CodigoTipoEstudio { get; set; } = string.Empty;
    public string CodigoTecnico { get; set; } = string.Empty;
    public string CodigoEquipo { get; set; } = string.Empty;
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public decimal DosisRadiacion { get; set; }
    public bool ContrasteAplicado { get; set; }
    public string EstadoInforme { get; set; } = "Pendiente";
}
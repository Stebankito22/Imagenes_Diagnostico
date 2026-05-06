namespace ImagenDiagnostico.DTOs;

public class InformeRadiologicoDto
{
    public string Codigo { get; set; } = string.Empty;
    public string CodigoEstudio { get; set; } = string.Empty;
    public string Radiologo { get; set; } = string.Empty;
    public string Hallazgos { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
}

public class ResultadoOrdenDto
{
    public string CodigoEstudio { get; set; } = string.Empty;
    public string CodigoOrden { get; set; } = string.Empty;
    public string PacienteNombre { get; set; } = string.Empty;
    public int PacienteId { get; set; }
    public string TipoEstudio { get; set; } = string.Empty;
    public string Modalidad { get; set; } = string.Empty;
    public string Tecnico { get; set; } = string.Empty;
    public string Radiologo { get; set; } = string.Empty;
    public string Hallazgos { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
    public DateTime FechaEstudio { get; set; }
    public DateTime FechaEmision { get; set; }
}

public class OrdenExamenPendienteDto
{
    public string CodigoOrden { get; set; } = string.Empty;
    public int PacienteId { get; set; }
    public string TipoEstudioSolicitado { get; set; } = string.Empty;
    public string Urgencia { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public string EstadoEstudio { get; set; } = string.Empty;
    public string EstadoInforme { get; set; } = string.Empty;
}

public class OrdenExamenDto
{
    public string Codigo { get; set; } = string.Empty;
    public int PacienteId { get; set; }
    public string PacienteNombre { get; set; } = string.Empty;
    public string MedicoSolicitante { get; set; } = string.Empty;
    public int MedicoSolicitanteId { get; set; }
    public string CodigoTipoEstudio { get; set; } = string.Empty;
    public string TipoEstudio { get; set; } = string.Empty;
    public string IndicacionClinica { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public string Urgencia { get; set; } = string.Empty;
    public bool RequiereContraste { get; set; }
}

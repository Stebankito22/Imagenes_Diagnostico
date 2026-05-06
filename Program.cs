using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS - Allow frontend and external services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "API Diagnóstico por Imágenes",
        Version = "v1",
        Description = @"Microservicio del Servicio de Diagnóstico por Imágenes del Hospital.

## Endpoints por categoría

- **Órdenes de Imagen** → Consultas Externas (Wilson), Hospitalización (Juan), Emergencias (Alfredo)
- **Tipos de Estudio** → Catálogo de estudios disponibles (Rayos X, TAC, RMN, Ecografía)
- **Estudios Realizados** → Tu equipo de técnicos y radiólogos
- **Equipos / Técnicos** → Gestión de recursos
- **Informes Radiológicos** → Radiólogos (Joel), Atención al Paciente (Enny)
- **Integraciones** → Endpoints para TODOS los compañeros

## Áreas que consumen esta API

| Área | Responsable | Endpoints clave |
|------|-------------|-----------------|
| Consultas Externas | Wilson Yucra | POST /ordenesimagen, GET /informes/resultado/{orden} |
| Hospitalización | Juan Cruz | POST /ordenesimagen/orden-examen |
| Emergencias | Alfredo Herbas | PATCH /integraciones/emergencias/priorizar/{orden} |
| Farmacia | Sergio Villarrubia | GET /integraciones/farmacia/contrastes-pendientes |
| Facturación | Carlos Balcazar | GET /integraciones/facturacion/estudios-finalizados |
| Atención Paciente | Enny Lopez | GET /integraciones/atencion/informes-listos |
| Telemedicina | Ricardo Valencia | GET /integraciones/telemedicina/estudios-compartibles |
| RRHH | Rodrigo Porcel | GET /integraciones/rrhh/tecnicos-activos |
| Inventarios | Juan Reyes | GET /integraciones/inventarios/resumen-insumos |

**Responsable:** Joel David Cerrogrande Ortega - Mayo 2026",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Joel David Cerrogrande Ortega"
        }
    });

    // Add XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);

    c.OrderActionsBy(api => api.RelativePath);
});

var app = builder.Build();

// CORS before other middleware
app.UseCors("AllowAll");

// Swagger
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "API Diagnóstico por Imágenes V1");
    options.RoutePrefix = "swagger";
});

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

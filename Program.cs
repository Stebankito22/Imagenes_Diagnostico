using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;

var builder = WebApplication.CreateBuilder(args);

// Database - Railway sets ConnectionStrings__DefaultConnection
var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(connStr) && connStr.StartsWith("postgres://"))
{
    // Railway usa postgres:// - convertir a Npgsql format
    var uri = new Uri(connStr);
    var userInfo = uri.UserInfo.Split(':');
    connStr = $"Host={uri.Host};Port={uri.Port};Database={uri.LocalPath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

// CORS
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
- **Órdenes de Imagen** → Consultas Externas, Hospitalización, Emergencias
- **Tipos de Estudio** → Catálogo de estudios disponibles
- **Estudios Realizados** → Tu equipo de técnicos y radiólogos
- **Equipos / Técnicos** → Gestión de recursos
- **Informes Radiológicos** → Radiólogos, Atención al Paciente
- **Integraciones** → Endpoints para TODOS los compañeros

**Responsable:** Joel David Cerrogrande Ortega - Mayo 2026"
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);

    c.OrderActionsBy(api => api.RelativePath);
});

var app = builder.Build();

// CORS
app.UseCors("AllowAll");

// Swagger (solo en desarrollo o si no hay frontend)
var isProduction = app.Environment.IsProduction();
var hasFrontend = Directory.Exists(Path.Combine(app.Environment.ContentRootPath, "wwwroot"));

if (!isProduction || !hasFrontend)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        options.RoutePrefix = "swagger";
    });
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Servir archivos estáticos del frontend (React build)
if (hasFrontend)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Para SPA: cualquier ruta no-API redirige al index.html
if (hasFrontend)
{
    app.MapFallbackToFile("index.html");
}

app.Run();

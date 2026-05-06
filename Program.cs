using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// 1. Conexión a BD (soporta formato postgresql:// de Render)
var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(connStr) && (connStr.StartsWith("postgres://") || connStr.StartsWith("postgresql://")))
{
    // Reemplazar esquema y añadir parámetros SSL para Npgsql
    var npgsqlUrl = connStr.Replace("postgres://", "postgresql://");
    var csb = new NpgsqlConnectionStringBuilder(npgsqlUrl);
    csb.SslMode = Npgsql.SslMode.Require;
    connStr = csb.ConnectionString;
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

// 2. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
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
        Description = "Microservicio del Servicio de Diagnóstico por Imágenes."
    });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);
    c.OrderActionsBy(api => api.RelativePath);
});

var app = builder.Build();

// 3. AUTO-MIGRACIÓN: Crea las tablas automáticamente al iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// 4. Middlewares
app.UseCors("AllowAll");

var hasFrontend = Directory.Exists(Path.Combine(app.Environment.ContentRootPath, "wwwroot"));

if (!app.Environment.IsProduction() || !hasFrontend)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        c.RoutePrefix = "swagger";
    });
}

if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();

if (hasFrontend)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

if (!app.Environment.IsProduction())
    app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

if (hasFrontend)
    app.MapFallbackToFile("index.html");

// Bind to PORT env variable for Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

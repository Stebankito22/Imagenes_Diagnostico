using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Data;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// 1. Conexión a BD (soporta formato postgresql:// de Render)
var configConnStr = builder.Configuration.GetConnectionString("DefaultConnection");
var envConnStr = Environment.GetEnvironmentVariable("DATABASE_URL");
var rawConnStr = string.IsNullOrWhiteSpace(configConnStr) ? envConnStr : configConnStr;

if (string.IsNullOrWhiteSpace(rawConnStr))
    throw new InvalidOperationException("No connection string found. Set DATABASE_URL or ConnectionStrings__DefaultConnection.");

var connStr = rawConnStr.Trim();
Console.WriteLine($"[DB] connStr starts with: '{connStr.Substring(0, Math.Min(connStr.Length, 25))}'");

if (connStr.StartsWith("postgres://") || connStr.StartsWith("postgresql://"))
{
    var scheme = connStr.StartsWith("postgresql://") ? "postgresql://" : "postgres://";
    var uri = new Uri(connStr.Replace(scheme, "http://"));
    var dbParts = uri.LocalPath.TrimStart('/').Split(new[] { '?' }, 2);
    var dbName = dbParts[0];
    var dbPort = uri.IsDefaultPort ? 5432 : uri.Port;
    var userInfo = uri.UserInfo.Split(new[] { ':' }, 2);
    var dbUser = Uri.UnescapeDataString(userInfo[0]);
    var dbPass = Uri.UnescapeDataString(userInfo[1]);
    
    var csb = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = dbPort,
        Database = dbName,
        Username = dbUser,
        Password = dbPass,
        SslMode = SslMode.Require
    };
    connStr = csb.ConnectionString;
    Console.WriteLine($"[DB] Parsed from URI. Host={uri.Host}, Port={dbPort}, DB={dbName}");
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

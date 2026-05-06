using Microsoft.EntityFrameworkCore;
using ImagenDiagnostico.Models;

namespace ImagenDiagnostico.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TipoEstudio> TiposEstudio { get; set; }
    public DbSet<OrdenImagen> OrdenesImagen { get; set; }
    public DbSet<EstudioRealizado> EstudiosRealizados { get; set; }
    public DbSet<Equipo> Equipos { get; set; }
    public DbSet<TecnicoEjecutor> TecnicosEjecutores { get; set; }
    public DbSet<InformeRadiologico> InformesRadiologicos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TipoEstudio>().HasQueryFilter(t => t.Estado == "Activo");
        modelBuilder.Entity<OrdenImagen>().HasQueryFilter(o => o.Estado == "Activo");
        modelBuilder.Entity<EstudioRealizado>().HasQueryFilter(e => e.Estado == "Activo");

        modelBuilder.Entity<TipoEstudio>()
            .HasIndex(t => t.Codigo)
            .IsUnique();

        modelBuilder.Entity<OrdenImagen>()
            .HasIndex(o => o.Codigo)
            .IsUnique();

        modelBuilder.Entity<EstudioRealizado>()
            .HasIndex(e => e.Codigo)
            .IsUnique();

        modelBuilder.Entity<TipoEstudio>()
            .Property(t => t.PrecioBase)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Equipo>()
            .HasQueryFilter(e => e.Estado == "Activo");

        modelBuilder.Entity<Equipo>()
            .HasIndex(e => e.Codigo)
            .IsUnique();

        modelBuilder.Entity<TecnicoEjecutor>()
            .HasQueryFilter(t => t.Estado == "Activo");

        modelBuilder.Entity<TecnicoEjecutor>()
            .HasIndex(t => t.Codigo)
            .IsUnique();

        modelBuilder.Entity<EstudioRealizado>()
            .HasOne(e => e.Equipo)
            .WithMany(eq => eq.EstudiosRealizados)
            .HasForeignKey(e => e.EquipoId);

        modelBuilder.Entity<EstudioRealizado>()
            .HasOne(e => e.TecnicoEjecutor)
            .WithMany(t => t.EstudiosRealizados)
            .HasForeignKey(e => e.TecnicoEjecutorId);

        modelBuilder.Entity<InformeRadiologico>()
            .HasQueryFilter(i => i.Estado != "Eliminado");

        modelBuilder.Entity<InformeRadiologico>()
            .HasIndex(i => i.Codigo)
            .IsUnique();

        modelBuilder.Entity<InformeRadiologico>()
            .HasOne(i => i.EstudioRealizado)
            .WithMany(e => e.InformesRadiologicos)
            .HasForeignKey(i => i.EstudioRealizadoId);
    }
}
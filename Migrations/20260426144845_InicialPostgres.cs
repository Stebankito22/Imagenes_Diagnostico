using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ImagenDiagnostico.Migrations
{
    /// <inheritdoc />
    public partial class InicialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrdenesImagen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    PacienteId = table.Column<int>(type: "integer", nullable: false),
                    MedicoSolicitanteId = table.Column<int>(type: "integer", nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Urgencia = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenesImagen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposEstudio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Modalidad = table.Column<string>(type: "text", nullable: false),
                    PrecioBase = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposEstudio", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstudiosRealizados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    OrdenImagenId = table.Column<int>(type: "integer", nullable: false),
                    TipoEstudioId = table.Column<int>(type: "integer", nullable: false),
                    TecnicoEjecutorId = table.Column<int>(type: "integer", nullable: false),
                    FechaHoraInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaHoraFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstudiosRealizados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EstudiosRealizados_OrdenesImagen_OrdenImagenId",
                        column: x => x.OrdenImagenId,
                        principalTable: "OrdenesImagen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EstudiosRealizados_TiposEstudio_TipoEstudioId",
                        column: x => x.TipoEstudioId,
                        principalTable: "TiposEstudio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EstudiosRealizados_Codigo",
                table: "EstudiosRealizados",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EstudiosRealizados_OrdenImagenId",
                table: "EstudiosRealizados",
                column: "OrdenImagenId");

            migrationBuilder.CreateIndex(
                name: "IX_EstudiosRealizados_TipoEstudioId",
                table: "EstudiosRealizados",
                column: "TipoEstudioId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesImagen_Codigo",
                table: "OrdenesImagen",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposEstudio_Codigo",
                table: "TiposEstudio",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstudiosRealizados");

            migrationBuilder.DropTable(
                name: "OrdenesImagen");

            migrationBuilder.DropTable(
                name: "TiposEstudio");
        }
    }
}

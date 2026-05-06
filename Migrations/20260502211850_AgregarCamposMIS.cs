using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ImagenDiagnostico.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCamposMIS : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequiereContraste",
                table: "TiposEstudio",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ContrasteAplicado",
                table: "EstudiosRealizados",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "DosisRadiacion",
                table: "EstudiosRealizados",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "EquipoId",
                table: "EstudiosRealizados",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EstadoInforme",
                table: "EstudiosRealizados",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Equipos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Modalidad = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TecnicosEjecutores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Especialidad = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TecnicosEjecutores", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EstudiosRealizados_EquipoId",
                table: "EstudiosRealizados",
                column: "EquipoId");

            migrationBuilder.CreateIndex(
                name: "IX_EstudiosRealizados_TecnicoEjecutorId",
                table: "EstudiosRealizados",
                column: "TecnicoEjecutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Equipos_Codigo",
                table: "Equipos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TecnicosEjecutores_Codigo",
                table: "TecnicosEjecutores",
                column: "Codigo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EstudiosRealizados_Equipos_EquipoId",
                table: "EstudiosRealizados",
                column: "EquipoId",
                principalTable: "Equipos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EstudiosRealizados_TecnicosEjecutores_TecnicoEjecutorId",
                table: "EstudiosRealizados",
                column: "TecnicoEjecutorId",
                principalTable: "TecnicosEjecutores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EstudiosRealizados_Equipos_EquipoId",
                table: "EstudiosRealizados");

            migrationBuilder.DropForeignKey(
                name: "FK_EstudiosRealizados_TecnicosEjecutores_TecnicoEjecutorId",
                table: "EstudiosRealizados");

            migrationBuilder.DropTable(
                name: "Equipos");

            migrationBuilder.DropTable(
                name: "TecnicosEjecutores");

            migrationBuilder.DropIndex(
                name: "IX_EstudiosRealizados_EquipoId",
                table: "EstudiosRealizados");

            migrationBuilder.DropIndex(
                name: "IX_EstudiosRealizados_TecnicoEjecutorId",
                table: "EstudiosRealizados");

            migrationBuilder.DropColumn(
                name: "RequiereContraste",
                table: "TiposEstudio");

            migrationBuilder.DropColumn(
                name: "ContrasteAplicado",
                table: "EstudiosRealizados");

            migrationBuilder.DropColumn(
                name: "DosisRadiacion",
                table: "EstudiosRealizados");

            migrationBuilder.DropColumn(
                name: "EquipoId",
                table: "EstudiosRealizados");

            migrationBuilder.DropColumn(
                name: "EstadoInforme",
                table: "EstudiosRealizados");
        }
    }
}

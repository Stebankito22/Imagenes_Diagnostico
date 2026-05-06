using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ImagenDiagnostico.Migrations
{
    /// <inheritdoc />
    public partial class AgregarInformesRadiologicos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InformesRadiologicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    EstudioRealizadoId = table.Column<int>(type: "integer", nullable: false),
                    Radiologo = table.Column<string>(type: "text", nullable: false),
                    Hallazgos = table.Column<string>(type: "text", nullable: false),
                    Diagnostico = table.Column<string>(type: "text", nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformesRadiologicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InformesRadiologicos_EstudiosRealizados_EstudioRealizadoId",
                        column: x => x.EstudioRealizadoId,
                        principalTable: "EstudiosRealizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InformesRadiologicos_Codigo",
                table: "InformesRadiologicos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InformesRadiologicos_EstudioRealizadoId",
                table: "InformesRadiologicos",
                column: "EstudioRealizadoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InformesRadiologicos");
        }
    }
}

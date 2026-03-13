using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EuroTrans.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_trucks_is_active",
                table: "trucks",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_trucks_status",
                table: "trucks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_created_at",
                table: "shipments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_status",
                table: "shipments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_employees_is_active",
                table: "employees",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_employees_role",
                table: "employees",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "IX_drivers_status",
                table: "drivers",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_trucks_is_active",
                table: "trucks");

            migrationBuilder.DropIndex(
                name: "IX_trucks_status",
                table: "trucks");

            migrationBuilder.DropIndex(
                name: "IX_shipments_created_at",
                table: "shipments");

            migrationBuilder.DropIndex(
                name: "IX_shipments_status",
                table: "shipments");

            migrationBuilder.DropIndex(
                name: "IX_employees_is_active",
                table: "employees");

            migrationBuilder.DropIndex(
                name: "IX_employees_role",
                table: "employees");

            migrationBuilder.DropIndex(
                name: "IX_drivers_status",
                table: "drivers");
        }
    }
}

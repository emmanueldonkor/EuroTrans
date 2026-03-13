using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EuroTrans.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompositeIndices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_shipments_started_at_delivered_at",
                table: "shipments",
                columns: new[] { "started_at", "delivered_at" },
                filter: "started_at IS NOT NULL AND delivered_at IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_status_created_at",
                table: "shipments",
                columns: new[] { "status", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_shipments_started_at_delivered_at",
                table: "shipments");

            migrationBuilder.DropIndex(
                name: "IX_shipments_status_created_at",
                table: "shipments");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EuroTrans.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlignDriverFkAndPodModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_drivers_employees_EmployeeId",
                table: "drivers");

            migrationBuilder.DropIndex(
                name: "IX_drivers_EmployeeId",
                table: "drivers");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "drivers");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "trucks",
                type: "BLOB",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "shipments",
                type: "BLOB",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "drivers",
                type: "BLOB",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.UpdateData(
                table: "employees",
                keyColumn: "id",
                keyValue: new Guid("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
                column: "created_at",
                value: new DateTime(2026, 2, 20, 14, 21, 58, 818, DateTimeKind.Utc).AddTicks(1504));

            migrationBuilder.AddForeignKey(
                name: "FK_drivers_employees_employee_id",
                table: "drivers",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_drivers_employees_employee_id",
                table: "drivers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "trucks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "shipments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "drivers");

            migrationBuilder.AddColumn<Guid>(
                name: "EmployeeId",
                table: "drivers",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                table: "employees",
                keyColumn: "id",
                keyValue: new Guid("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
                column: "created_at",
                value: new DateTime(2026, 2, 17, 20, 40, 19, 692, DateTimeKind.Utc).AddTicks(4884));

            migrationBuilder.CreateIndex(
                name: "IX_drivers_EmployeeId",
                table: "drivers",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_drivers_employees_EmployeeId",
                table: "drivers",
                column: "EmployeeId",
                principalTable: "employees",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

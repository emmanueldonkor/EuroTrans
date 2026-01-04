using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EuroTrans.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    auth0_user_id = table.Column<string>(type: "TEXT", nullable: false),
                    name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    role = table.Column<string>(type: "TEXT", nullable: false),
                    avatar_url = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "trucks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    plate_number = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    model = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    capacity = table.Column<float>(type: "REAL", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trucks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "drivers",
                columns: table => new
                {
                    employee_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    license_number = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_drivers", x => x.employee_id);
                    table.ForeignKey(
                        name: "FK_drivers_employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shipments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    tracking_id = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    cargo_description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    cargo_weight = table.Column<float>(type: "REAL", nullable: false),
                    cargo_volume = table.Column<float>(type: "REAL", nullable: false),
                    origin_address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    origin_city = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    origin_country = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    origin_postal_code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    origin_lat = table.Column<float>(type: "REAL", nullable: false),
                    origin_lng = table.Column<float>(type: "REAL", nullable: false),
                    destination_address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    destination_city = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    destination_country = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    destination_postal_code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    destination_lat = table.Column<float>(type: "REAL", nullable: false),
                    destination_lng = table.Column<float>(type: "REAL", nullable: false),
                    driver_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    truck_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: true),
                    started_at = table.Column<DateTime>(type: "TEXT", nullable: true),
                    delivered_at = table.Column<DateTime>(type: "TEXT", nullable: true),
                    estimated_delivery_date = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipments", x => x.id);
                    table.ForeignKey(
                        name: "FK_shipments_drivers_driver_id",
                        column: x => x.driver_id,
                        principalTable: "drivers",
                        principalColumn: "employee_id");
                    table.ForeignKey(
                        name: "FK_shipments_trucks_truck_id",
                        column: x => x.truck_id,
                        principalTable: "trucks",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "activities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    shipment_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    employee_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    type = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activities", x => x.id);
                    table.ForeignKey(
                        name: "FK_activities_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_activities_shipments_shipment_id",
                        column: x => x.shipment_id,
                        principalTable: "shipments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    shipment_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    uploaded_by_employee_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    type = table.Column<string>(type: "TEXT", nullable: false),
                    url = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_documents_shipments_shipment_id",
                        column: x => x.shipment_id,
                        principalTable: "shipments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "milestones",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    shipment_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    created_by_employee_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    type = table.Column<string>(type: "TEXT", nullable: false),
                    note = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    location_lat = table.Column<float>(type: "REAL", nullable: false),
                    location_lng = table.Column<float>(type: "REAL", nullable: false),
                    timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_milestones", x => x.id);
                    table.ForeignKey(
                        name: "FK_milestones_shipments_shipment_id",
                        column: x => x.shipment_id,
                        principalTable: "shipments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activities_employee_id",
                table: "activities",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_activities_shipment_id",
                table: "activities",
                column: "shipment_id");

            migrationBuilder.CreateIndex(
                name: "IX_documents_shipment_id",
                table: "documents",
                column: "shipment_id");

            migrationBuilder.CreateIndex(
                name: "IX_drivers_EmployeeId",
                table: "drivers",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_employees_auth0_user_id",
                table: "employees",
                column: "auth0_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_milestones_shipment_id",
                table: "milestones",
                column: "shipment_id");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_driver_id",
                table: "shipments",
                column: "driver_id");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_tracking_id",
                table: "shipments",
                column: "tracking_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_shipments_truck_id",
                table: "shipments",
                column: "truck_id");

            migrationBuilder.CreateIndex(
                name: "IX_trucks_plate_number",
                table: "trucks",
                column: "plate_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activities");

            migrationBuilder.DropTable(
                name: "documents");

            migrationBuilder.DropTable(
                name: "milestones");

            migrationBuilder.DropTable(
                name: "shipments");

            migrationBuilder.DropTable(
                name: "drivers");

            migrationBuilder.DropTable(
                name: "trucks");

            migrationBuilder.DropTable(
                name: "employees");
        }
    }
}

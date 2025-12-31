using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EuroTrans.Infrastructure.Migrations
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
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "trucks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PlateNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Model = table.Column<string>(type: "TEXT", nullable: false),
                    Capacity = table.Column<float>(type: "REAL", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trucks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "activities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_activities_employees_UserId",
                        column: x => x.UserId,
                        principalTable: "employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "drivers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    LicenseNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CurrentShipmentId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_drivers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_drivers_employees_Id",
                        column: x => x.Id,
                        principalTable: "employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shipments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TrackingId = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CargoDescription = table.Column<string>(type: "TEXT", nullable: false),
                    CargoWeight = table.Column<float>(type: "REAL", nullable: false),
                    CargoVolume = table.Column<float>(type: "REAL", nullable: false),
                    OriginAddress = table.Column<string>(type: "TEXT", nullable: false),
                    OriginCity = table.Column<string>(type: "TEXT", nullable: false),
                    OriginCountry = table.Column<string>(type: "TEXT", nullable: false),
                    OriginPostalCode = table.Column<string>(type: "TEXT", nullable: false),
                    OriginLat = table.Column<float>(type: "REAL", nullable: false),
                    OriginLng = table.Column<float>(type: "REAL", nullable: false),
                    DestinationAddress = table.Column<string>(type: "TEXT", nullable: false),
                    DestinationCity = table.Column<string>(type: "TEXT", nullable: false),
                    DestinationCountry = table.Column<string>(type: "TEXT", nullable: false),
                    DestinationPostalCode = table.Column<string>(type: "TEXT", nullable: false),
                    DestinationLat = table.Column<float>(type: "REAL", nullable: false),
                    DestinationLng = table.Column<float>(type: "REAL", nullable: false),
                    CurrentLocationJson = table.Column<string>(type: "TEXT", nullable: true),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: true),
                    TruckId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EstimatedDeliveryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ProofOfDeliveryUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shipments_drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_shipments_trucks_TruckId",
                        column: x => x.TruckId,
                        principalTable: "trucks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "milestones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Note = table.Column<string>(type: "TEXT", nullable: true),
                    LocationAddress = table.Column<string>(type: "TEXT", nullable: false),
                    LocationCity = table.Column<string>(type: "TEXT", nullable: false),
                    LocationCountry = table.Column<string>(type: "TEXT", nullable: false),
                    LocationPostalCode = table.Column<string>(type: "TEXT", nullable: false),
                    LocationLat = table.Column<float>(type: "REAL", nullable: false),
                    LocationLng = table.Column<float>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_milestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_milestones_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activities_ShipmentId",
                table: "activities",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_activities_UserId",
                table: "activities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_drivers_CurrentShipmentId",
                table: "drivers",
                column: "CurrentShipmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_employees_Email",
                table: "employees",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_milestones_ShipmentId",
                table: "milestones",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_DriverId",
                table: "shipments",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_TrackingId",
                table: "shipments",
                column: "TrackingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_shipments_TruckId",
                table: "shipments",
                column: "TruckId");

            migrationBuilder.CreateIndex(
                name: "IX_trucks_PlateNumber",
                table: "trucks",
                column: "PlateNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_activities_shipments_ShipmentId",
                table: "activities",
                column: "ShipmentId",
                principalTable: "shipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_drivers_shipments_CurrentShipmentId",
                table: "drivers",
                column: "CurrentShipmentId",
                principalTable: "shipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_drivers_employees_Id",
                table: "drivers");

            migrationBuilder.DropForeignKey(
                name: "FK_drivers_shipments_CurrentShipmentId",
                table: "drivers");

            migrationBuilder.DropTable(
                name: "activities");

            migrationBuilder.DropTable(
                name: "milestones");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropTable(
                name: "shipments");

            migrationBuilder.DropTable(
                name: "drivers");

            migrationBuilder.DropTable(
                name: "trucks");
        }
    }
}

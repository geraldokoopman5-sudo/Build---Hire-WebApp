using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BuildAndHire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdminAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Admin",
                columns: table => new
                {
                    AdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    passWord = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AdminRole = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admin", x => x.AdminId);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    CompanyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyEmail = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_AddressId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    address_StreetAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_Suburb = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_Province = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_PostalCode = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RegistrationNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaxNumber = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.CompanyId);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    address_AddressId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    address_StreetAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_Suburb = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_Province = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_PostalCode = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.CustomerId);
                });

            migrationBuilder.CreateTable(
                name: "Jobs",
                columns: table => new
                {
                    JobId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JobDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DaysWorking = table.Column<int>(type: "int", nullable: false),
                    DailyRate = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PayingMethod = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    address_AddressId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    address_StreetAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_Suburb = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_Province = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address_PostalCode = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jobs", x => x.JobId);
                    table.ForeignKey(
                        name: "FK_Jobs_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_Jobs_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId");
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JobId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TransactionReference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_Payment_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId");
                    table.ForeignKey(
                        name: "FK_Payment_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "JobId");
                });

            migrationBuilder.CreateTable(
                name: "Workers",
                columns: table => new
                {
                    WorkerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkerFirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkerLastNAme = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkerStatus = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JobId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workers", x => x.WorkerId);
                    table.ForeignKey(
                        name: "FK_Workers_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_Workers_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "JobId");
                });

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "CompanyId", "CompanyEmail", "CompanyName", "Password", "RegistrationNumber", "Status", "TaxNumber", "address_AddressId", "address_City", "address_PostalCode", "address_Province", "address_StreetAddress", "address_Suburb" },
                values: new object[,]
                {
                    { new Guid("a1111111-0000-0000-0000-000000000001"), "info@capecoastalconstruction.co.za", "Cape Coastal Construction (Pty) Ltd", "Password123!", "2015/123456/07", 0, "9012345671", new Guid("f1111111-0000-0000-0000-000000000001"), "Cape Town", 8001, "Western Cape", "12 Long Street", "Cape Town City Centre" },
                    { new Guid("a1111111-0000-0000-0000-000000000002"), "admin@joburgrise.co.za", "Joburg Rise Builders", "Password123!", "2017/654321/07", 0, "9012345672", new Guid("f1111111-0000-0000-0000-000000000002"), "Johannesburg", 2196, "Gauteng", "45 Jan Smuts Avenue", "Rosebank" },
                    { new Guid("a1111111-0000-0000-0000-000000000003"), "contracts@durbanbay.co.za", "Durban Bay Contractors", "Password123!", "2019/789012/07", 1, "9012345673", new Guid("f1111111-0000-0000-0000-000000000003"), "Durban", 4001, "KwaZulu-Natal", "78 Marine Parade", "Durban Central" }
                });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "CustomerId", "CustomerName", "Email", "Password", "Status", "address_AddressId", "address_City", "address_PostalCode", "address_Province", "address_StreetAddress", "address_Suburb" },
                values: new object[,]
                {
                    { new Guid("b2222222-0000-0000-0000-000000000001"), "Thandiwe Mahlangu", "thandiwe.mahlangu@example.com", "Password123!", 0, new Guid("f2222222-0000-0000-0000-000000000001"), "Cape Town", 8001, "Western Cape", "23 Kloof Street", "Gardens" },
                    { new Guid("b2222222-0000-0000-0000-000000000002"), "Johan van der Berg", "johan.vdberg@example.com", "Password123!", 0, new Guid("f2222222-0000-0000-0000-000000000002"), "Cape Town", 7530, "Western Cape", "9 Voortrekker Road", "Bellville" },
                    { new Guid("b2222222-0000-0000-0000-000000000003"), "Aisha Patel", "aisha.patel@example.com", "Password123!", 0, new Guid("f2222222-0000-0000-0000-000000000003"), "Johannesburg", 2196, "Gauteng", "156 Oxford Road", "Melrose" },
                    { new Guid("b2222222-0000-0000-0000-000000000004"), "Sipho Ndlovu", "sipho.ndlovu@example.com", "Password123!", 0, new Guid("f2222222-0000-0000-0000-000000000004"), "Durban", 4001, "KwaZulu-Natal", "34 Point Road", "Point" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Companies_CompanyEmail",
                table: "Companies",
                column: "CompanyEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_CompanyId",
                table: "Jobs",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_CustomerId",
                table: "Jobs",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_CustomerId",
                table: "Payment",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_JobId",
                table: "Payment",
                column: "JobId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Workers_CompanyId",
                table: "Workers",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Workers_JobId",
                table: "Workers",
                column: "JobId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "Workers");

            migrationBuilder.DropTable(
                name: "Jobs");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}

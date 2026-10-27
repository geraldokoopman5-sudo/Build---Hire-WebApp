using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildAndHire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProfilePhotosAndCompletedWork : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "ProfilePhoto",
                table: "Customers",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "ProfilePhoto",
                table: "Companies",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "ProfilePhoto",
                table: "Admin",
                type: "bytea",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CompletedWorkPosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Location = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CompletedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    Photo = table.Column<byte[]>(type: "bytea", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletedWorkPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompletedWorkPosts_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompletedWorkPosts_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "JobId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompletedWorkPosts_CompanyId_CreatedAt",
                table: "CompletedWorkPosts",
                columns: new[] { "CompanyId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CompletedWorkPosts_JobId",
                table: "CompletedWorkPosts",
                column: "JobId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM "CompletedWorkPosts")
                       OR EXISTS (SELECT 1 FROM "Customers" WHERE "ProfilePhoto" IS NOT NULL)
                       OR EXISTS (SELECT 1 FROM "Companies" WHERE "ProfilePhoto" IS NOT NULL)
                       OR EXISTS (SELECT 1 FROM "Admin" WHERE "ProfilePhoto" IS NOT NULL) THEN
                        RAISE EXCEPTION 'Profile photos and completed-work posts must be preserved before rollback.';
                    END IF;
                END $$;
                """);
            migrationBuilder.DropTable(
                name: "CompletedWorkPosts");

            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "Admin");
        }
    }
}

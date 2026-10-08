using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildAndHire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AllowUnassignedWorkersAndJobAcceptance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "JobId",
                table: "Workers",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<DateTime>(
                name: "AcceptedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            // Preserve existing assignments as jobs already accepted by their company.
            migrationBuilder.Sql("""
                UPDATE "Jobs" AS j SET "AcceptedAt" = CURRENT_TIMESTAMP
                WHERE EXISTS (SELECT 1 FROM "Workers" AS w WHERE w."JobId" = j."JobId");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Do not silently replace unassigned workers with an invalid foreign key.
            migrationBuilder.Sql("""
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM "Workers" WHERE "JobId" IS NULL) THEN
                        RAISE EXCEPTION 'Assign all workers to jobs before reverting this migration.';
                    END IF;
                END $$;
                """);
            migrationBuilder.DropColumn(
                name: "AcceptedAt",
                table: "Jobs");

            migrationBuilder.AlterColumn<Guid>(
                name: "JobId",
                table: "Workers",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}

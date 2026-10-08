using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BuildAndHire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class JobAndQuoteLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "QuoteAcceptedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "QuoteSentAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);
            migrationBuilder.Sql("""
                UPDATE "Jobs" SET "Status" = CASE
                    WHEN "Status" = 2 THEN 8
                    WHEN "AcceptedAt" IS NOT NULL THEN 5
                    ELSE 4 END
                WHERE "Status" IN (1, 2, 3);
                UPDATE "Jobs" SET "QuoteSentAt" = CURRENT_TIMESTAMP
                WHERE "Quote" > 0;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM "Jobs" WHERE "QuoteAcceptedAt" IS NOT NULL OR "Status" IN (6,7,8,9))
                       OR EXISTS (SELECT 1 FROM "Workers" WHERE "JobId" IS NULL) THEN
                        RAISE EXCEPTION 'Lifecycle history cannot be represented by the previous schema.';
                    END IF;
                END $$;
                UPDATE "Jobs" SET "Status" = CASE WHEN "Status" = 4 THEN 3 ELSE 1 END
                WHERE "Status" IN (4,5);
                """);
            migrationBuilder.DropColumn(
                name: "QuoteAcceptedAt",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "QuoteSentAt",
                table: "Jobs");
        }
    }
}

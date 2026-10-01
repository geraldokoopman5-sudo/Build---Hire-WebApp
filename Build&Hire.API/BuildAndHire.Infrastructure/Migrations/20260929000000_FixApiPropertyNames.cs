using Microsoft.EntityFrameworkCore.Migrations;
namespace BuildAndHire.Infrastructure.Migrations;
public partial class FixApiPropertyNames : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(name: "WorkerLastNAme", table: "Workers", newName: "WorkerLastName");
        migrationBuilder.RenameColumn(name: "Qoute", table: "Jobs", newName: "Quote");
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(name: "WorkerLastName", table: "Workers", newName: "WorkerLastNAme");
        migrationBuilder.RenameColumn(name: "Quote", table: "Jobs", newName: "Qoute");
    }
}

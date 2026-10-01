namespace Build_Hire.API.Startup;

public static class SuperAdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        // Explicit opt-in avoids connecting to a database during tooling/builds.
        if (!configuration.GetValue<bool>("BootstrapAdmin:Enabled")) return;
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<BuildAndHireDbContext>();
        // Serialize bootstrap across instances sharing this PostgreSQL database.
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(71725286)");
        if (await db.Admin.AnyAsync(a => a.AdminRole == AdminEnums.SuperAdmin)) return;

        var email = configuration["BootstrapAdmin:Email"]?.Trim();
        var password = configuration["BootstrapAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) ||
            !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email) ||
            string.IsNullOrWhiteSpace(password) || password.Length < 12)
            throw new InvalidOperationException("Configure a valid BootstrapAdmin:Email and a BootstrapAdmin:Password of at least 12 characters.");

        if (await db.Admin.AnyAsync(a => a.Email.ToLower() == email.ToLower()) ||
            await db.Customers.AnyAsync(c => c.Email.ToLower() == email.ToLower()) ||
            await db.Companies.AnyAsync(c => c.CompanyEmail.ToLower() == email.ToLower()))
            throw new InvalidOperationException("The bootstrap email is already in use.");

        var passwords = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        db.Admin.Add(new Admin
        {
            AdminId = Guid.NewGuid(), UserName = "SuperAdmin", Email = email,
            PasswordHash = passwords.HashPassword(password),
            Status = AccountStatus.Active, accountType = AccountType.Admin,
            AdminRole = AdminEnums.SuperAdmin
        });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}

using System.Security;

namespace Build_Hire.API.Startup;

public static class AdminPasswordReset
{
    public static async Task RunInteractiveAsync(IServiceProvider services)
    {
        if (Console.IsInputRedirected)
            throw new InvalidOperationException("Run password recovery in an interactive terminal. Passwords are entered privately, not through command arguments or redirected input.");

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<BuildAndHireDbContext>();
        var passwords = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        var admins = await db.Admin.AsNoTracking().OrderBy(a => a.Email)
            .Select(a => new { a.AdminId, a.Email, a.AdminRole, a.Status }).ToListAsync();
        if (admins.Count == 0) throw new InvalidOperationException("No administrator accounts exist in the configured database. Use first-administrator bootstrap instead.");

        Console.WriteLine("Administrator accounts in the configured database:");
        foreach (var admin in admins)
            Console.WriteLine($"  {admin.Email} ({admin.AdminRole}, {admin.Status})");
        Console.Write("Email of administrator to reset (blank to cancel): ");
        var email = Console.ReadLine()?.Trim();
        if (string.IsNullOrEmpty(email)) { Console.WriteLine("Cancelled. No password was changed."); return; }
        var matches = admins.Where(a => string.Equals(a.Email, email, StringComparison.OrdinalIgnoreCase)).ToList();
        if (matches.Count != 1) throw new InvalidOperationException("Expected exactly one matching administrator. Choose an email from the list above.");
        var target = matches[0];

        using var secret = ReadPassword("New password (at least 12 characters): ");
        using var confirmation = ReadPassword("Confirm new password: ");
        var password = new System.Net.NetworkCredential("", secret).Password;
        if (password != new System.Net.NetworkCredential("", confirmation).Password)
            throw new InvalidOperationException("Passwords did not match. No password was changed.");

        await ResetAsync(db, passwords, target.AdminId, password);
        Console.WriteLine($"Password updated for {target.Email}. Sign in using that exact email capitalization.");
        if (target.Status != AccountStatus.Active)
            Console.WriteLine($"Account status remains {target.Status}; the account must be Active to sign in.");
    }

    public static async Task ResetAsync(BuildAndHireDbContext db, IPasswordService passwords, Guid adminId, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 12)
            throw new ArgumentException("Use a password of at least 12 characters. No password was changed.");

        var hash = passwords.HashPassword(newPassword);
        var updated = await db.Admin.Where(a => a.AdminId == adminId)
            .ExecuteUpdateAsync(update => update.SetProperty(a => a.PasswordHash, hash));
        if (updated != 1) throw new KeyNotFoundException("Administrator no longer exists. No password was changed.");
    }

    private static SecureString ReadPassword(string prompt)
    {
        Console.Write(prompt);
        var secret = new SecureString();
        while (true)
        {
            var key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter) { Console.WriteLine(); return secret; }
            if (key.Key == ConsoleKey.Backspace)
            {
                if (secret.Length > 0) secret.RemoveAt(secret.Length - 1);
            }
            else if (!char.IsControl(key.KeyChar)) secret.AppendChar(key.KeyChar);
        }
    }
}

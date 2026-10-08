using Npgsql;

namespace Build_Hire.API.Startup;

public static class DeploymentConfiguration
{
    public static void Validate(IConfiguration configuration, bool development)
    {
        var connection = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connection))
            throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection.");
        try
        {
            var parsed = new NpgsqlConnectionStringBuilder(connection);
            if (string.IsNullOrWhiteSpace(parsed.Host) || string.IsNullOrWhiteSpace(parsed.Database))
                throw new ArgumentException();
        }
        catch (ArgumentException)
        {
            throw new InvalidOperationException("DefaultConnection must specify a valid PostgreSQL host and database.");
        }
        foreach (var field in new[] { "Issuer", "Audience" })
            if (string.IsNullOrWhiteSpace(configuration[$"JwtConfig:{field}"]))
                throw new InvalidOperationException($"Configure JwtConfig:{field}.");
        if (Encoding.UTF8.GetByteCount(configuration["JwtConfig:Key"] ?? "") < 64)
            throw new InvalidOperationException("JwtConfig:Key must contain at least 64 UTF-8 bytes for HMAC SHA-512.");
        if (!int.TryParse(configuration["JwtConfig:TokenValidityMins"], out var minutes) || minutes < 1 || minutes > 1440)
            throw new InvalidOperationException("JwtConfig:TokenValidityMins must be between 1 and 1440.");
        var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        if (!development && (origins is null || origins.Length == 0))
            throw new InvalidOperationException("Configure Cors:AllowedOrigins for production.");
        foreach (var origin in origins ?? [])
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) ||
                (uri.Scheme != "https" && (uri.Scheme != "http" || !development)) ||
                !string.IsNullOrEmpty(uri.UserInfo) || uri.AbsolutePath != "/" ||
                !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment) ||
                origin.EndsWith('/') || uri.Host.Contains('*'))
                throw new InvalidOperationException("CORS origins must be exact origins without paths or trailing slashes; production requires HTTPS.");
        foreach (var proxy in configuration.GetSection("Proxy:KnownProxies").Get<string[]>() ?? [])
            if (!System.Net.IPAddress.TryParse(proxy, out _))
                throw new InvalidOperationException("Proxy:KnownProxies must contain individual IP addresses.");
    }
}

using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Build_Hire.API.Startup;

public sealed class DatabaseReadinessCheck(IServiceScopeFactory scopes) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<BuildAndHireDbContext>();
        try
        {
            if (!await db.Database.CanConnectAsync(cancellationToken)) return HealthCheckResult.Unhealthy();
            if ((await db.Database.GetPendingMigrationsAsync(cancellationToken)).Any()) return HealthCheckResult.Unhealthy();
            return HealthCheckResult.Healthy();
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            // Public probes contain only the health status, never database details.
            return HealthCheckResult.Unhealthy();
        }
    }
}

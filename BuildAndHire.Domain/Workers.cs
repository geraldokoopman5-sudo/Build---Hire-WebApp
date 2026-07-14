using BuildAndHire.Domain.Enums;

namespace BuildAndHire.Domain;

public class Workers
{
    public Guid WorkerId { get; set; }

    public string WorkerFirstName { get; set; } = string.Empty;

    public string WorkerLastNAme { get; set; } = string.Empty;

    public string WorkEmail { get; set; } = string.Empty;

    public AccountStatus WorkerStatus { get; set; }//will be used for now until I decide I want to make a different set of enums
    
}

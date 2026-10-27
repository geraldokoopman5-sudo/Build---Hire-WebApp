namespace BuildAndHire.Domain.Models;

public class CompletedWorkPost
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid? JobId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateOnly CompletedOn { get; set; }
    public byte[] Photo { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

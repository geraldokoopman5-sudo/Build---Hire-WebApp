namespace BuildAndHire.Domain.Models;

public class Jobs
{
    public Guid JobId { get; set; }

    public Guid CompanyId { get; set; }
    public Companies companies{ get; set; }

    public Guid CustomerId { get; set; }
    public Customer customer{ get; set; }

    public string JobDescription { get; set; } = string.Empty;

    public int DaysWorking { get; set; }
    
    public decimal DailyRate { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
  
}

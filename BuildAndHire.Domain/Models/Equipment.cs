using BuildAndHire.Domain.Enums;

namespace BuildAndHire.Domain.Models;

public class Equipment
{
    public Guid EquipmentId { get; set; }

    public string EquipmentName { get; set; } = string.Empty;

    public Guid CompanyId { get; set; }
    public Companies? companies { get; set; }

    public string Description { get; set; } = string.Empty;

    public EquipmentStatus Status { get; set; }
    
    public int DaysRented{ get; set; }
}

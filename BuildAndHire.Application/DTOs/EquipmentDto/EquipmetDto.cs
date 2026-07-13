using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.Enums;
namespace BuildAndHire.Application.DTOs.EquipmentDto;

public class EquipmetDto
{
    public Guid EquipmentId { get; set; }

    public string EquipmentName { get; set; } = string.Empty;

    public Guid CompanyId { get; set; }
    public Companies? companies { get; set; }

    public string Description { get; set; } = string.Empty;

    public EquipmentStatus Status { get; set; }
    
    public int DaysRented{ get; set; }//Make a rental model for renting equipmentn has to have a foreign key with equipmentId
}

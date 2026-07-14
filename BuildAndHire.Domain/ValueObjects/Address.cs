namespace BuildAndHire.Domain.ValueObjects;

public class Address
{
    public string StreetAddress { get; set; } = string.Empty;

    public string Suburb { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Province { get; set; }=string.Empty;
    
    public int PostalCode { get; set; }
    
    
}

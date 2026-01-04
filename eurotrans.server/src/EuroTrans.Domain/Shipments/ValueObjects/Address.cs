namespace EuroTrans.Domain.Shipments.ValueObjects;

public class Address
{
    public string AddressLine { get; } = string.Empty;
    public string City { get; } = string.Empty;
    public string Country { get; } = string.Empty;
    public string PostalCode { get; } = string.Empty;

    private Address() { }

    public Address(string addressLine, string city, string country, string postalCode)
    {
        AddressLine = addressLine;
        City = city;
        Country = country;
        PostalCode = postalCode;
    }
}
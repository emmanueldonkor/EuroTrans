namespace EuroTrans.Application.features.Shipments.CreateShipment;

public record CreateShipmentRequest(
    CargoDto Cargo,
    AddressDto Origin,
    AddressDto Destination,
    DateTime? EstimatedDeliveryDate
);

public record CargoDto(string Description, float Weight, float Volume);

public record AddressDto(
    string AddressLine,
    string City,
    string Country,
    string PostalCode
);

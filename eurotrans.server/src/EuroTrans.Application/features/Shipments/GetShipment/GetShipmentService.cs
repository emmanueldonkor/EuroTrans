using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetShipment;

public class GetShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;

    public GetShipmentService(
        IShipmentRepository shipments,
        ICurrentUser currentUser)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
    }

    public async Task<GetShipmentResponse> GetAsync(Guid id)
    {
        var shipment = await shipments.GetByIdAsync(id)
            ?? throw new DomainException("Shipment not found.");

        // Drivers can only view their own shipments
        if (currentUser.IsDriver && shipment.DriverId != currentUser.Id)
            throw new DomainException("You are not allowed to view this shipment.");

        return new GetShipmentResponse(
            shipment.Id,
            shipment.TrackingId,
            shipment.Status,
            shipment.Cargo.Description,
            shipment.Cargo.Weight,
            shipment.Cargo.Volume,
            new AddressDto(
                shipment.OriginAddress.AddressLine,
                shipment.OriginAddress.City,
                shipment.OriginAddress.Country,
                shipment.OriginAddress.PostalCode
            ),
            new AddressDto(
                shipment.DestinationAddress.AddressLine,
                shipment.DestinationAddress.City,
                shipment.DestinationAddress.Country,
                shipment.DestinationAddress.PostalCode
            ),
            shipment.CreatedAtUtc,
            shipment.EstimatedDeliveryDateUtc,
            shipment.DriverId,
            shipment.TruckId,
            shipment.Milestones.Select(m => new MilestoneDto(
                m.Id,
                m.LocationLat,
                m.LocationLng,
                m.Note,
                m.TimestampUtc
            )).ToList(),
            shipment.Activities.Select(a => new ActivityDto(
                a.Id,
                a.Description,
                a.Type,
                a.TimestampUtc
            )).ToList()
        );
    }
}

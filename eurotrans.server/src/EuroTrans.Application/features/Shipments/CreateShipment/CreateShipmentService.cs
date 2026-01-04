using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Common.Exceptions;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.ValueObjects;

namespace EuroTrans.Application.features.Shipments.CreateShipment;

public class CreateShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly IDateTimeProvider clock;

    public CreateShipmentService(
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentUser = currentUser;
        this.clock = clock;
    }

    public async Task<Guid> CreateAsync(CreateShipmentRequest request)
    {
        if (!currentUser.IsManager)
            throw new DomainException("Only managers can create shipments.");

        var trackingId = $"ET-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(1000, 9999)}";

        var shipment = Shipment.CreateDraft(
            id: Guid.NewGuid(),
            trackingId: trackingId,
            cargo: new Cargo(request.Cargo.Description, request.Cargo.Weight, request.Cargo.Volume),
            originAddress: new Address(request.Origin.AddressLine, request.Origin.City, request.Origin.Country, request.Origin.PostalCode),
            originLocation: new GeoLocation(0, 0),
            destinationAddress: new Address(request.Destination.AddressLine, request.Destination.City, request.Destination.Country, request.Destination.PostalCode),
            destinationLocation: new GeoLocation(0, 0),
            createdAtUtc: clock.UtcNow,
            estimatedDeliveryDateUtc: request.EstimatedDeliveryDate,
            managerId: currentUser.Id,
            timestampUtc: clock.UtcNow
        );

        await shipments.AddAsync(shipment);
        await uow.SaveChangesAsync();

        return shipment.Id;
    }
}

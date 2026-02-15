using ErrorOr;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.ValueObjects;

namespace EuroTrans.Application.features.Shipments.CreateShipment;

public class CreateShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public CreateShipmentService(
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Guid>> CreateAsync(CreateShipmentRequest request, CancellationToken ct = default)
    {
        if (!currentUser.IsManager)
            return Error.Forbidden(description: "Only managers can create shipments.");

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

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
            managerId: employeeIdResult.Value,
            timestampUtc: clock.UtcNow
        );

        await shipments.AddAsync(shipment, ct);
        await uow.SaveChangesAsync(ct);

        return shipment.Id;
    }
}
using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Shipments;
using EuroTrans.Domain.Shipments.ValueObjects;

namespace EuroTrans.Application.features.Shipments.CreateShipment;

public class CreateShipmentService
{
    private readonly ILogger<CreateShipmentService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly ITrackingIdGenerator trackingIdGenerator;
    private readonly IQueryCache cache;

    public CreateShipmentService(
        ILogger<CreateShipmentService> logger,
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock,
        ITrackingIdGenerator trackingIdGenerator,
        IQueryCache cache)
    {
        this.logger = logger;
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
        this.trackingIdGenerator = trackingIdGenerator;
        this.cache = cache;
    }

    public async Task<ErrorOr<Guid>> CreateAsync(CreateShipmentRequest request, CancellationToken ct = default)
    {
        logger.LogInformation(
            "Create shipment requested. CargoDescription: {CargoDescription}, OriginCity: {OriginCity}, DestinationCity: {DestinationCity}",
            request.Cargo.Description,
            request.Origin.City,
            request.Destination.City);

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning("Create shipment denied due to missing current employee context.");
            return employeeIdResult.Errors;
        }

        var trackingId = trackingIdGenerator.Generate();

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
        cache.BumpVersion(QueryCacheScopes.Shipments);

        logger.LogInformation(
            "Shipment created successfully. ShipmentId: {ShipmentId}, TrackingId: {TrackingId}, ManagerId: {ManagerId}",
            shipment.Id,
            trackingId,
            employeeIdResult.Value);

        return shipment.Id;
    }

}

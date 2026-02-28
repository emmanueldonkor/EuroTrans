using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.Milestone;

public class MilestoneService
{
    private readonly ILogger<MilestoneService> logger;
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;
    private readonly IQueryCache cache;

    public MilestoneService(
       ILogger<MilestoneService> logger,
       IShipmentRepository shipments,
       IUnitOfWork uow,
       ICurrentEmployeeProvider currentEmployeeProvider,
       IDateTimeProvider clock,
       IQueryCache cache)
    {
        this.logger = logger;
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
        this.cache = cache;
    }

    public async Task<ErrorOr<Success>> AddAsync(Guid shipmentId, MilestoneRequest request, CancellationToken ct = default)
    {
        logger.LogInformation(
            "Add milestone requested. ShipmentId: {ShipmentId}, Type: {MilestoneType}",
            shipmentId,
            request.Type);

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
        {
            logger.LogWarning("Add milestone denied due to missing current employee context. ShipmentId: {ShipmentId}", shipmentId);
            return employeeIdResult.Errors;
        }

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
        {
            logger.LogWarning("Add milestone failed. Shipment not found. ShipmentId: {ShipmentId}", shipmentId);
            return Error.NotFound(description: "Shipment not found.");
        }

        var result = shipment.AddMilestone(
            driverId: employeeIdResult.Value,
            lat: request.Latitude,
            lon: request.Longitude,
            note: request.Note,
            locationLabel: request.LocationLabel,
            type: request.Type,
            timestampUtc: clock.UtcNow
        );

        if (result.IsError)
        {
            logger.LogWarning("Add milestone rejected by domain rules. ShipmentId: {ShipmentId}, Type: {MilestoneType}", shipmentId, request.Type);
            return result.Errors;
        }

        await uow.SaveChangesAsync(ct);
        cache.BumpVersion(QueryCacheScopes.Shipments);

        logger.LogInformation("Milestone added successfully. ShipmentId: {ShipmentId}, Type: {MilestoneType}", shipmentId, request.Type);

        return Result.Success;
    }
}

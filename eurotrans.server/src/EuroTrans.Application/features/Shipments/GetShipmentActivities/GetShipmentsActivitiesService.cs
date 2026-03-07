using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Shipments.Enums;


namespace EuroTrans.Application.features.Shipments.GetShipmentActivities;

public class GetShipmentActivitiesService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IQueryCache cache;

    public GetShipmentActivitiesService(
        IShipmentRepository shipments,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IQueryCache cache)
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.cache = cache;
    }

    public async Task<ErrorOr<List<GetShipmentActivitiesResponse>>> GetAsync(Guid shipmentId, CancellationToken ct = default)
    {
        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            var shipmentForAuthorization = await shipments.GetForTrackingAsync(shipmentId, ct);
            if (shipmentForAuthorization is null)
                return Error.NotFound(description: "Shipment not found.");

            if (shipmentForAuthorization.DriverId != employeeIdResult.Value)
                return Error.Forbidden(description: "You are not allowed to view this shipment.");
        }

        var version = cache.GetVersion(QueryCacheScopes.Shipments);
        var key = $"shipments:activities:{shipmentId}:v{version}";

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.ShipmentsDetails,
            async token =>
            {
                var shipment = await shipments.GetByIdAsync(shipmentId, token);
                if (shipment is null)
                    return Error.NotFound(description: "Shipment not found.");

                return (ErrorOr<List<GetShipmentActivitiesResponse>>)shipment.Activities
                    .OrderBy(a => a.TimestampUtc)
                    .Select(a => new GetShipmentActivitiesResponse(
                        a.Id,
                        a.EmployeeId,
                        a.Type,
                        a.Description,
                        a.TimestampUtc,
                        ResolveActorName(a.Type, a.Employee?.Name)
                    ))
                    .ToList();
            },
            ct);
    }

    private static string ResolveActorName(ActivityType type, string? employeeName)
    {
        if (!string.IsNullOrWhiteSpace(employeeName))
            return employeeName;

        return type switch
        {
            ActivityType.Created or ActivityType.Assigned or ActivityType.Cancelled => "Manager",
            ActivityType.Started or ActivityType.Delivered or ActivityType.MilestoneAdded => "Driver",
            _ => "User"
        };
    }
}

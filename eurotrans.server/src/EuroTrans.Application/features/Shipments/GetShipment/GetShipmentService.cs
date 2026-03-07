using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipment;

public class GetShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IQueryCache cache;

    public GetShipmentService(
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

    public async Task<ErrorOr<GetShipmentResponse>> GetAsync(Guid id, CancellationToken ct = default)
    {
        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            var shipmentForAuthorization = await shipments.GetForTrackingAsync(id, ct);
            if (shipmentForAuthorization is null)
                return Error.NotFound("Shipment not found.");

            if (shipmentForAuthorization.DriverId != employeeIdResult.Value)
                return Error.Forbidden("You are not allowed to view this shipment.");
        }

        var version = cache.GetVersion(QueryCacheScopes.Shipments);
        var key = $"shipments:item:{id}:v{version}";

        return await cache.GetOrCreateAsync<ErrorOr<GetShipmentResponse>>(
            key,
            QueryCacheTtls.ShipmentsDetails,
            async token =>
            {
                var shipment = await shipments.GetByIdAsync(id, token);
                if (shipment is null)
                    return Error.NotFound("Shipment not found.");

                return new GetShipmentResponse(
                    shipment.Id,
                    shipment.TrackingId,
                    shipment.Status,
                    new CargoDto(
                        shipment.Cargo.Description,
                        shipment.Cargo.Weight,
                        shipment.Cargo.Volume
                    ),
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
                    shipment.UpdatedAtUtc,
                    shipment.StartedAtUtc,
                    shipment.DeliveredAtUtc,
                    shipment.EstimatedDeliveryDateUtc,
                    shipment.Documents
                        .OrderByDescending(d => d.UploadedAtUtc)
                        .FirstOrDefault(d => d.Type == Domain.Shipments.Enums.DocumentType.ProofOfDelivery)?.Url,
                    shipment.DriverId,
                    shipment.TruckId,
                    shipment.Driver is null
                        ? null
                        : new DriverDto(
                            shipment.Driver.Id,
                            ResolveDriverName(shipment.Driver.Employee?.Name),
                            shipment.Driver.Phone
                        ),
                    shipment.Truck is null
                        ? null
                        : new TruckDto(
                            shipment.Truck.Id,
                            shipment.Truck.PlateNumber,
                            shipment.Truck.Model
                        ),
                    shipment.Activities
                        .OrderBy(a => a.TimestampUtc)
                        .Select(a => new ActivityDto(
                            a.Id,
                            a.Description,
                            a.Type,
                            a.TimestampUtc,
                            a.EmployeeId,
                            ResolveActorName(a.Type, a.Employee?.Name)
                        ))
                        .ToList(),
                    shipment.Milestones
                        .OrderBy(m => m.TimestampUtc)
                        .Select(m => new MilestoneDto(
                            m.Id,
                            m.Type,
                            m.LocationLat,
                            m.LocationLng,
                            m.Note,
                            m.LocationLabel,
                            m.TimestampUtc,
                            ResolveMilestoneActorName(m.Employee?.Name)
                        ))
                        .ToList()
                );
            },
            ct);
    }

    private static string ResolveDriverName(string? employeeName)
    {
        return string.IsNullOrWhiteSpace(employeeName) ? "Driver" : employeeName;
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

    private static string ResolveMilestoneActorName(string? employeeName)
    {
        return string.IsNullOrWhiteSpace(employeeName) ? "Driver" : employeeName;
    }
}

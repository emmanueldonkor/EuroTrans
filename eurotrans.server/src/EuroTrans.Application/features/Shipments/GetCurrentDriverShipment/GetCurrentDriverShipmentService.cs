using ErrorOr;
using EuroTrans.Application.Common.Caching;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetCurrentDriverShipment;

public class GetCurrentDriverShipmentService
{
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IShipmentRepository shipments;
    private readonly IQueryCache cache;

    public GetCurrentDriverShipmentService(
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IShipmentRepository shipments,
        IQueryCache cache)
    {
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.shipments = shipments;
        this.cache = cache;
    }

    public async Task<ErrorOr<GetCurrentDriverShipmentResponse?>> GetAsync(CancellationToken ct = default)
    {
        if (!currentUser.IsDriver)
            return Error.Forbidden(description: "Current user is not a driver.");

        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var driverId = employeeIdResult.Value;
        var version = cache.GetVersion(QueryCacheScopes.Shipments);
        var key = $"shipments:driver-current:v{version}:driver={driverId}";

        return await cache.GetOrCreateAsync(
            key,
            QueryCacheTtls.ShipmentsDetails,
            async token =>
            {
                var shipment = await shipments.GetCurrentForDriverAsync(driverId, token);
                if (shipment is null)
                    return (ErrorOr<GetCurrentDriverShipmentResponse?>)(GetCurrentDriverShipmentResponse?)null;

                return (ErrorOr<GetCurrentDriverShipmentResponse?>)new GetCurrentDriverShipmentResponse(
                    shipment.Id,
                    shipment.TrackingId,
                    shipment.Status,
                    shipment.CargoDescription,
                    shipment.CargoWeight,
                    shipment.CargoVolume,
                    shipment.OriginAddress,
                    shipment.OriginCity,
                    shipment.OriginCountry,
                    shipment.OriginPostalCode,
                    shipment.DestinationAddress,
                    shipment.DestinationCity,
                    shipment.DestinationCountry,
                    shipment.DestinationPostalCode
                );
            },
            ct);
    }
}

using ErrorOr;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.GetShipment;

public class GetShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly ICurrentUser currentUser;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;

    public GetShipmentService(
        IShipmentRepository shipments,
        ICurrentUser currentUser,
        ICurrentEmployeeProvider currentEmployeeProvider
        )
    {
        this.shipments = shipments;
        this.currentUser = currentUser;
        this.currentEmployeeProvider = currentEmployeeProvider;
    }

    public async Task<ErrorOr<GetShipmentResponse>> GetAsync(Guid id, CancellationToken ct = default)
    {
        var shipment = await shipments.GetByIdAsync(id, ct);

        if (shipment is null)
            return Error.NotFound("Shipment not found.");

        if (currentUser.IsDriver)
        {
            var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
            if (employeeIdResult.IsError)
                return employeeIdResult.Errors;

            if (shipment.DriverId != employeeIdResult.Value)
                return Error.Forbidden("You are not allowed to view this shipment.");
        }

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
            shipment.Driver.Employee?.Name ?? "Unknown",
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
            a.Employee?.Name ?? "Unknown"
        )).ToList(),

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
            m.Employee?.Name ?? "Unknown"
        )).ToList()
);

    }
}

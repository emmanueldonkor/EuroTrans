using ErrorOr;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Application.features.Shipments.StartShipment;

public class StartShipmentService
{
    private readonly IShipmentRepository shipments;
    private readonly IUnitOfWork uow;
    private readonly ICurrentEmployeeProvider currentEmployeeProvider;
    private readonly IDateTimeProvider clock;

    public StartShipmentService(
        IShipmentRepository shipments,
        IUnitOfWork uow,
        ICurrentEmployeeProvider currentEmployeeProvider,
        IDateTimeProvider clock)
    {
        this.shipments = shipments;
        this.uow = uow;
        this.currentEmployeeProvider = currentEmployeeProvider;
        this.clock = clock;
    }

    public async Task<ErrorOr<Success>> StartAsync(Guid shipmentId, CancellationToken ct = default)
    {
        var employeeIdResult = await currentEmployeeProvider.GetEmployeeIdAsync();
        if (employeeIdResult.IsError)
            return employeeIdResult.Errors;

        var shipment = await shipments.GetByIdAsync(shipmentId, ct);
        if (shipment is null)
            return Error.NotFound(description: "Shipment not found.");

        var result = shipment.Start(employeeIdResult.Value, clock.UtcNow);

        if (result.IsError)
            return result.Errors;

        await uow.SaveChangesAsync(ct);

        return Result.Success;
    }
}

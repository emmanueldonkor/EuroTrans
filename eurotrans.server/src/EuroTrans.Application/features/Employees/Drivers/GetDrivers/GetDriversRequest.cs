using EuroTrans.Domain.Employees.Enums;

namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public record GetDriversRequest(
    string? Search = null,
    DriverStatus? Status = null,
    int Page = 1,
    int PageSize = 20
);

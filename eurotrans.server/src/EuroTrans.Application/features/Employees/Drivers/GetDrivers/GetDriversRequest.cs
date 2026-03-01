namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public record GetDriversRequest(
    int Page = 1,
    int PageSize = 20
);

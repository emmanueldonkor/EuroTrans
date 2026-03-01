namespace EuroTrans.Application.features.Employees.Drivers.GetDrivers;

public record GetDriversPagedResponse(
    IReadOnlyList<GetDriversResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);

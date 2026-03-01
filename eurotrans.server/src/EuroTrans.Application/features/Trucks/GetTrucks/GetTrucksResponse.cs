using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTrucks;

public record GetTrucksResponse(
    IReadOnlyList<Truck> Items,
    int TotalCount,
    int Page,
    int PageSize
);

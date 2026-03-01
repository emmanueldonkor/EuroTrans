using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTrucks;

public record GetTrucksRequest(
    string? Search = null,
    TruckStatus? Status = null,
    int Page = 1,
    int PageSize = 20
);

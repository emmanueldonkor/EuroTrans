namespace EuroTrans.Application.features.Trucks.GetTrucks;

public record GetTrucksRequest(
    int Page = 1,
    int PageSize = 20
);

using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.GetTruckOptions;

public record GetTruckOptionsResponse(
    Guid Id,
    string PlateNumber,
    string Model,
    TruckStatus Status);

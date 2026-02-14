using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks.CreateTruck;

public record CreateTruckRequest(
    string PlateNumber,
    string Model,
    float Capacity,
    TruckStatus Status
);

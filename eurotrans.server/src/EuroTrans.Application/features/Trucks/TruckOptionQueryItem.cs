using EuroTrans.Domain.Trucks;

namespace EuroTrans.Application.features.Trucks;

public record TruckOptionQueryItem(
    Guid Id,
    string PlateNumber,
    string Model,
    TruckStatus Status);

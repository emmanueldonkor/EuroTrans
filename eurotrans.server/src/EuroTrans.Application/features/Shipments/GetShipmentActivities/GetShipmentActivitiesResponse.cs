using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.GetShipmentActivities;

public record GetShipmentActivitiesResponse(
    Guid Id,
    Guid EmployeeId,
    ActivityType Type,
    string Description,
    //Guid CreatedByEmployeeId,
    DateTime TimestampUtc
);

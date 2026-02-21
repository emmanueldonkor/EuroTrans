using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Application.features.Shipments.Milestone;

public record MilestoneRequest(
    double Latitude,
    double Longitude,
    string Note,
    string? LocationLabel,
    MilestoneType Type = MilestoneType.Checkpoint
);

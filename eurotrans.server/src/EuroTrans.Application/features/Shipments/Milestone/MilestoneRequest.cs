namespace EuroTrans.Application.features.Shipments.Milestone;

public record MilestoneRequest(
    double Latitude,
    double Longitude,
    string Note
);

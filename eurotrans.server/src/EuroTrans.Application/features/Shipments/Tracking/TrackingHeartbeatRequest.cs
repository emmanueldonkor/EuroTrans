namespace EuroTrans.Application.features.Shipments.Tracking;

public record TrackingHeartbeatRequest(
    double Latitude,
    double Longitude,
    string? LocationLabel
);

namespace EuroTrans.Application.features.Analytics.GetAnalyticsOverview;

public record AnalyticsOverviewResponse(
    int TotalShipments,
    int ActiveShipments,
    int DeliveredShipments,
    string AvgDeliveryTime,
    int ActiveDrivers,
    int AvailableDrivers,
    List<AnalyticsOverviewShipmentTrendResponse> ShipmentsOverTime,
    List<AnalyticsOverviewDriverWorkloadResponse> DriverWorkloadDistribution);

public record AnalyticsOverviewShipmentTrendResponse(
    string Date,
    string Label,
    int Count);

public record AnalyticsOverviewDriverWorkloadResponse(
    string DriverName,
    int Assigned,
    int InTransit,
    int Total);

namespace EuroTrans.Application.features.Analytics;

public record AnalyticsOverviewQueryResult(
    int TotalShipments,
    int ActiveShipments,
    int DeliveredShipments,
    double? AverageDeliveryHours,
    int ActiveDrivers,
    int AvailableDrivers,
    List<AnalyticsShipmentTrendPoint> ShipmentsOverTime,
    List<AnalyticsDriverWorkloadPoint> DriverWorkloadDistribution);

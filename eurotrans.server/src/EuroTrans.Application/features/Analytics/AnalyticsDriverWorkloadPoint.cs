namespace EuroTrans.Application.features.Analytics;

public record AnalyticsDriverWorkloadPoint(
    string DriverName,
    int Assigned,
    int InTransit,
    int Total);

namespace EuroTrans.Application.features.Shipments.Tracking;

public record GetLivePinsRequest(
    int Page = 1,
    int PageSize = 20
);

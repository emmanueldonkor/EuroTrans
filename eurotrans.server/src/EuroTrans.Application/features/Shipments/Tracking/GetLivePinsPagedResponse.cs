namespace EuroTrans.Application.features.Shipments.Tracking;

public record GetLivePinsPagedResponse(
    IReadOnlyList<GetLivePinsResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);

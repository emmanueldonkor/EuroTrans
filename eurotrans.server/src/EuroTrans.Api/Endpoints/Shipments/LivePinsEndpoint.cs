using EuroTrans.Application.features.Shipments.Tracking;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[ApiEndpoint]
public static class LivePinsEndpoint
{
    public static void MapLivePinsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments/live-pins", async (
            [AsParameters] GetLivePinsRequest request,
            GetLivePinsService service,
            IValidator<GetLivePinsRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var pins = await service.GetAsync(request, ct);
            return Results.Ok(pins);
        })
        .RequireAuthorization("read:shipments");
    }
}

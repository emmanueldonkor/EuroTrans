using EuroTrans.Application.features.Shipments.GetShipments;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class GetShipmentsEndpoint
{
    public static void MapGetShipmentsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shipments", async (
            [AsParameters] GetShipmentsRequest request,
          [FromServices]  GetShipmentsService service,
            IValidator<GetShipmentsRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            var result = await service.GetAsync(request);
            return Results.Ok(result);
        })
        .RequireAuthorization("shipments:read");
    }
}

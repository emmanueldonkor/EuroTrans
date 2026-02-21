using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.CreateShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class CreateShipmentEndpoint
{
    public static void MapCreateShipmentEndpoint(this IEndpointRouteBuilder app)
    {

        app.MapPost("/api/shipments", async (
         CreateShipmentRequest request,
        [FromServices] CreateShipmentService service,
         CancellationToken ct,
         IValidator<CreateShipmentRequest> validator) =>
     {
         var validation = await validator.ValidateAsync(request, ct);
         if (!validation.IsValid)
             return Results.ValidationProblem(validation.ToDictionary());

         var result = await service.CreateAsync(request, ct);

         return result.Match(
             id => Results.Created($"/api/shipments/{id}", new { id }),
             errors => errors.ToProblem());
     }).RequireAuthorization("manager", "write:shipments");
    }
}

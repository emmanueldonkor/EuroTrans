using EuroTrans.Application.features.Shipments.CreateShipment;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;

public static class CreateShipmentEndpoint
{
    public static void MapCreateShipmentEndpoint(this IEndpointRouteBuilder app)
    {

    app.MapPost("/api/shipments", async (
     CreateShipmentRequest request,
     CreateShipmentService service,
     IValidator<CreateShipmentRequest> validator) =>
 {
     var validation = await validator.ValidateAsync(request);
     if (!validation.IsValid)
         return Results.BadRequest(validation.Errors);

     var id = await service.CreateAsync(request);

     return Results.Created($"/api/shipments/{id}", new { id });
 })
 .RequireAuthorization("manager");

    }
}
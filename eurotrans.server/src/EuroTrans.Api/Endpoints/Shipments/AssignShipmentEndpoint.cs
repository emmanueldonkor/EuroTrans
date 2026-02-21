using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Shipments.AssignShipment;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Shipments;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class AssignShipmentEndpoint
{
    public static void MapAssignShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/assign", async (Guid id, AssignShipmentRequest request, [FromServices] AssignShipmentService service, CancellationToken ct, IValidator<AssignShipmentRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.ToDictionary());
            }

            var result = await service.AssignAsync(id, request, ct);
            return result.Match(
                _ => Results.Ok(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:shipments");
    }
}

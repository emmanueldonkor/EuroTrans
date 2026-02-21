using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Trucks.UpdateTruck;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Trucks;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class UpdateTruckStatusEndpoint
{
    public static void MapUpdateTruckStatusEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/trucks/{id}/status", async (
            Guid id,
            UpdateTruckStatusRequest request,
            [FromServices] UpdateTruckStatusService service,
            IValidator<UpdateTruckStatusRequest> validator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await service.UpdateAsync(id, request.Status, ct);
            return result.Match(
                _ => Results.NoContent(),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("manager", "write:trucks");
    }
}

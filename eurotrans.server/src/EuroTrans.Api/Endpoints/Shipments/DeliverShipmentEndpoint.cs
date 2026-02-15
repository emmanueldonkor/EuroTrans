using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Shipments.DeliverShipment;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;


public static class DeliverShipmentEndpoint
{
    public static void MapDeliverShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/deliver", async (
            Guid id,
            IFormFile file,
            [FromServices] DeliverShipmentService service,
            [FromServices] IPodService podService,
            CancellationToken ct,
            IValidator<DeliverShipmentRequest> validator) =>
        {
            if (file == null || file.Length == 0)
                return Results.BadRequest("Proof of delivery file is required.");

            // 1. Upload file to Azure Blob
            using var stream = file.OpenReadStream();
            var url = await podService.UploadAsync(stream, file.FileName, file.ContentType);

            // 2. Build the request object with the URL
           var request = new DeliverShipmentRequest(url);
            

            // 3. Validate
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            // 4. Call the domain/application service
            var result = await service.DeliverAsync(id, request, ct);

            return result.Match(
                _ => Results.Ok(new { message = "Shipment delivered", proofUrl = url }),
                errors => errors.ToProblem());
        })
        .RequireAuthorization("driver", "write:shipments");;
    }
}


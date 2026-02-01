using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Shipments.DeliverShipment;
using FluentValidation;

namespace EuroTrans.Api.Endpoints.Shipments;


public static class DeliverShipmentEndpoint
{
    public static void MapDeliverShipmentEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/shipments/{id}/deliver", async (
            Guid id,
            IFormFile file,
            DeliverShipmentService service,
            IPodService podService,
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
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.BadRequest(validation.Errors);

            // 4. Call the domain/application service
            await service.DeliverAsync(id, request);

            return Results.Ok(new { message = "Shipment delivered", proofUrl = url });
        })
        .RequireAuthorization("driver");
    }
}


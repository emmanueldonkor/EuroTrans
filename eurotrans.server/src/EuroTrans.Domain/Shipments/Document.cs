using EuroTrans.Domain.Common;
using EuroTrans.Domain.Shipments.Enums;

namespace EuroTrans.Domain.Shipments;

public class Document : Entity
{
    public Guid ShipmentId { get; private set; }
    public Guid UploadedByEmployeeId { get; private set; }
    public DocumentType Type { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public DateTime UploadedAtUtc { get; private set; }

    private Document() { }

    public Document(
        Guid id,
        Guid shipmentId,
        Guid uploadedByEmployeeId,
        DocumentType type,
        string url,
        DateTime uploadedAtUtc)
        : base(id)
    {
        ShipmentId = shipmentId;
        UploadedByEmployeeId = uploadedByEmployeeId;
        Type = type;
        Url = url;
        UploadedAtUtc = uploadedAtUtc;
    }
}
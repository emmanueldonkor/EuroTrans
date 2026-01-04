namespace EuroTrans.Domain.Shipments.ValueObjects;

public class GeoLocation
{
    public float Latitude { get; }
    public float Longitude { get; }

    private GeoLocation() { }

    public GeoLocation(float latitude, float longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }
}

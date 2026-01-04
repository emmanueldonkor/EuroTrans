namespace EuroTrans.Domain.Shipments.ValueObjects;

public class Cargo
{
    public string Description { get; } = string.Empty;
    public float Weight { get; }
    public float Volume { get; }

    private Cargo() { }

    public Cargo(string description, float weight, float volume)
    {
        Description = description;
        Weight = weight;
        Volume = volume;
    }
}

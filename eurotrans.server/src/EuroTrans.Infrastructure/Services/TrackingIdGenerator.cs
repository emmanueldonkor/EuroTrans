using System.Text;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Infrastructure.Services;

public class TrackingIdGenerator : ITrackingIdGenerator
{
    private readonly IDateTimeProvider dateTimeProvider;
    private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public TrackingIdGenerator(IDateTimeProvider dateTimeProvider)
    {
        this.dateTimeProvider = dateTimeProvider;
    }

    public string Generate()
    {
        var year = dateTimeProvider.UtcNow.Year;
        var suffix = GenerateRandomString(8);
        return $"ET-{year}-{suffix}";
    }

    private static string GenerateRandomString(int length)
    {
        var sb = new StringBuilder(length);
        var random = Random.Shared;

        for (int i = 0; i < length; i++)
        {
            sb.Append(Chars[random.Next(Chars.Length)]);
        }

        return sb.ToString();
    }
}

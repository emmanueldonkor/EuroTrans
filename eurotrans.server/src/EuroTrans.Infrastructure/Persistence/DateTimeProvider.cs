using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Infrastructure.Persistence;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
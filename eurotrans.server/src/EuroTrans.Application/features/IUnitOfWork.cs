namespace EuroTrans.Application.features;

using ErrorOr;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<ErrorOr<Success>> SaveChangesWithConcurrencyCheckAsync(CancellationToken cancellationToken = default);
}
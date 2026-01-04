namespace EuroTrans.Application.features;

 public interface IUnitOfWork
{
  Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
} 
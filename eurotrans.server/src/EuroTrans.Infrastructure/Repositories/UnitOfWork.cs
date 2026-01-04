using EuroTrans.Application.features;
using EuroTrans.Infrastructure.Persistence;

namespace EuroTrans.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext db;

    public UnitOfWork(AppDbContext db)
    {
        this.db = db;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return db.SaveChangesAsync(cancellationToken);
    }
}


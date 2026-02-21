using ErrorOr;
using EuroTrans.Application.features;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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

    public async Task<ErrorOr<Success>> SaveChangesWithConcurrencyCheckAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return Result.Success;
        }
        catch (DbUpdateConcurrencyException)
        {
            return Error.Conflict(
                code: "Concurrency.Conflict",
                description: "The record was updated by another request. Refresh and retry.");
        }
        catch (DbUpdateException ex) when (IsPostgresConstraintViolation(ex))
        {
            return Error.Conflict(
                code: "Data.ConstraintViolation",
                description: "The operation violates a data integrity constraint.");
        }
    }

    private static bool IsPostgresConstraintViolation(DbUpdateException ex)
        => ex.InnerException is PostgresException
        {
            SqlState: "23505" or "23503" or "23514"
        };
}


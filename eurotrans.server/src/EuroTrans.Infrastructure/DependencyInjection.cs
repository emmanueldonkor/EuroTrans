using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Infrastructure.Persistence;
using EuroTrans.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace EuroTrans.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IShipmentRepository, ShipmentRepository>();
        services.AddScoped<IDateTimeProvider, DateTimeProvider>();
        return services;
    }
}
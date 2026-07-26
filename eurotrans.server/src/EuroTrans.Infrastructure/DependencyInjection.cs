using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Analytics;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Infrastructure.Persistence;
using EuroTrans.Infrastructure.Repositories;
using EuroTrans.Infrastructure.Services;
using EuroTrans.Infrastructure.Storage;
using Microsoft.Extensions.DependencyInjection;

namespace EuroTrans.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddHttpClient();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
        services.AddScoped<IShipmentRepository, ShipmentRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ITruckRepository, TruckRepository>();
        services.AddScoped<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IQueryCache, MemoryQueryCache>();
        services.AddSingleton<BlobContainerClientProvider>();
        services.AddSingleton<SupabasePodService>();
        services.AddSingleton<IPodService, PodService>();
        services.AddScoped<ITrackingIdGenerator, TrackingIdGenerator>();
        return services;
    }
}

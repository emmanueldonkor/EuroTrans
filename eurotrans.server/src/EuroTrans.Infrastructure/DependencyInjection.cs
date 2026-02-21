using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features;
using EuroTrans.Application.features.Shipments;
using EuroTrans.Application.features.Employees;
using EuroTrans.Application.features.Trucks;
using EuroTrans.Infrastructure.Persistence;
using EuroTrans.Infrastructure.Repositories;
using EuroTrans.Infrastructure.Services;
using EuroTrans.Infrastructure.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EuroTrans.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IShipmentRepository, ShipmentRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ITruckRepository, TruckRepository>();
        services.AddScoped<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();

            var connectionString = config["AzureStorage:ConnectionString"];
            var containerName = config["AzureStorage:Container"];

            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("AzureStorage:ConnectionString is missing.");

            if (string.IsNullOrWhiteSpace(containerName))
                throw new InvalidOperationException("AzureStorage:Container is missing.");

            var containerClient = new BlobContainerClient(connectionString, containerName);
            containerClient.CreateIfNotExists(PublicAccessType.None);
            return containerClient;
        });
        services.AddSingleton<IPodService, PodService>();
        services.AddScoped<ITrackingIdGenerator, TrackingIdGenerator>();
        return services;
    }
}

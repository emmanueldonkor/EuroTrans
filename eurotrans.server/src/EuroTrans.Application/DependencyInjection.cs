using System.Reflection;
using EuroTrans.Application.Common;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Application.features.Employees.Drivers.GetDriver;
using EuroTrans.Application.features.Employees.Drivers.GetDrivers;
using EuroTrans.Application.features.Employees.User;
using EuroTrans.Application.features.Shipments.AssignShipment;
using EuroTrans.Application.features.Shipments.CancelShipment;
using EuroTrans.Application.features.Shipments.CreateShipment;
using EuroTrans.Application.features.Shipments.DeliverShipment;
using EuroTrans.Application.features.Shipments.GetShipment;
using EuroTrans.Application.features.Shipments.GetShipmentActivities;
using EuroTrans.Application.features.Shipments.GetShipments;
using EuroTrans.Application.features.Shipments.Milestone;
using EuroTrans.Application.features.Shipments.StartShipment;
using EuroTrans.Application.features.Trucks.CreateTruck;
using EuroTrans.Application.features.Trucks.DeleteTruck;
using EuroTrans.Application.features.Trucks.GetTrucks;
using EuroTrans.Application.features.Trucks.UpdateTruck;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EuroTrans.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICurrentEmployeeProvider, CurrentEmployeeProvider>();
        services.AddScoped<CreateShipmentService>();
        services.AddScoped<AssignShipmentService>();
        services.AddScoped<StartShipmentService>();
        services.AddScoped<DeliverShipmentService>();
        services.AddScoped<CancelShipmentService>();
        services.AddScoped<MilestoneService>();
        services.AddScoped<GetShipmentsService>();
        services.AddScoped<GetShipmentService>();
        services.AddScoped<GetShipmentActivitiesService>();
        services.AddScoped<GetDriverService>();
        services.AddScoped<GetDriversService>();
         services.AddScoped<EnsureCurrentUserService>();
        services.AddScoped<SyncUserService>();
        services.AddScoped<CreateTruckService>();
        services.AddScoped<GetTrucksService>();
        services.AddScoped<UpdateTruckStatusService>();
        services.AddScoped<DeleteTruckService>();
        services.AddValidatorsFromAssembly(
            Assembly.GetExecutingAssembly());
        return services;
    }
}
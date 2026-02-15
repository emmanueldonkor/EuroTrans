using EuroTrans.Api.Endpoints.Employees;
using EuroTrans.Api.Endpoints.Shipments;
using EuroTrans.Api.Endpoints.Trucks;

namespace EuroTrans.Api.Endpoints;

public static class AllEndpoints
{
    public static void MapAllEndpoints(this WebApplication app)
    {
        //Shipment Endpoints
        app.MapCreateShipmentEndpoint();
        app.MapAssignShipmentEndpoint();
        app.MapStartShipmentEndpoint();
        app.MapCancelShipmentEndpoint();
        app.MapDeliverShipmentEndpoint();
        app.MapAddMilestoneEndpoint();
        app.MapGetShipmentsEndpoint();
        app.MapGetShipmentEndpoint();
        app.MapGetShipmentActivitiesEndpoint();

        //Employees Endpoints
        app.MapGetDriversEndpoint();
        app.MapGetDriverEndpoint();
        app.MapUpdateDriverStatusEndpoint();
        app.MapSyncUserEndpoint();

        //Truck Endpoints
        app.MapCreateTruckEndpoint();
        app.MapGetTrucksEndpoint();
        app.MapUpdateTruckStatusEndpoint();
        app.MapDeleteTruckEndpoint();
    }
}
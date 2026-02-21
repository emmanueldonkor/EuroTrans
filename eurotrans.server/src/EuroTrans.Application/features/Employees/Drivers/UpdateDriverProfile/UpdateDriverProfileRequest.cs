namespace EuroTrans.Application.features.Employees.Drivers.UpdateDriverProfile;

public record UpdateDriverProfileRequest(
    string Phone,
    string LicenseNumber
);

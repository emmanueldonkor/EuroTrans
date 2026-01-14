namespace EuroTrans.Application.features.Employees.User;

public record SyncUserRequest(
    string Auth0UserId,
    string Email,
    string Name,
    string Role 
);

using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Identity;

public class HasRoleRequirement(string role) : IAuthorizationRequirement
{
    public string Role { get; } = role;
}

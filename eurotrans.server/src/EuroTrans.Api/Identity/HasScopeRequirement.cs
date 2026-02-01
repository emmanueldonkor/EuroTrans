using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Identity;

public class HasScopeRequirement(string scope, string issuer) : IAuthorizationRequirement
{
    public string Scope { get; } = scope;
    public string Issuer { get; } = issuer;
}
namespace EuroTrans.Application.Common.Interfaces;

public interface ICurrentUser
{
    string Auth0UserId { get; }
    bool IsManager { get; }
    bool IsDriver { get; }
}

using ErrorOr;

namespace EuroTrans.Application.Common.Interfaces;

public interface ICurrentEmployeeProvider
{
    Task<ErrorOr<Guid>> GetEmployeeIdAsync();
}
using VehicleServiceAPI.DTOs;

namespace VehicleServiceAPI.Services
{
    public interface IServiceCatalogService
    {
        Task<IEnumerable<ServiceResponseDto>> GetAllServicesAsync(int? centerId = null);
        Task<ServiceResponseDto> GetServiceByIdAsync(int id);
        Task<ServiceResponseDto> CreateServiceAsync(CreateServiceDto dto);
        Task<ServiceResponseDto> UpdateServiceAsync(int id, UpdateServiceDto dto);
        Task<bool> DeleteServiceAsync(int id);
    }
}


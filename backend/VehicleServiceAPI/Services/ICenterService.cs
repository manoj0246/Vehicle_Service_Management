using VehicleServiceAPI.DTOs;

namespace VehicleServiceAPI.Services
{
    public interface ICenterService
    {
        Task<IEnumerable<CenterResponseDto>> GetAllCentersAsync();
        Task<CenterResponseDto> GetCenterByIdAsync(int id);
        Task<CenterResponseDto> CreateCenterAsync(CreateCenterDto dto);
        Task<CenterResponseDto> UpdateCenterAsync(int id, UpdateCenterDto dto);
    }
}


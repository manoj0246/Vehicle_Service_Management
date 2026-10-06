using VehicleServiceAPI.DTOs;

namespace VehicleServiceAPI.Services
{
    public interface IVehicleService
    {
        Task<IEnumerable<VehicleDto>> GetVehiclesByCustomerAsync(int customerId);
        Task<VehicleDto> GetVehicleByIdAsync(int id, int customerId);
        Task<VehicleDto> CreateVehicleAsync(int customerId, CreateVehicleDto createDto);
        Task<VehicleDto> UpdateVehicleAsync(int id, int customerId, UpdateVehicleDto updateDto);
        Task<bool> DeleteVehicleAsync(int id, int customerId);
        Task<bool> VehicleExistsAsync(int id, int customerId);
    }
}
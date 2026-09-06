using VehicleServiceAPI.DTOs;

namespace VehicleServiceAPI.Services
{
    public interface ITechnicianService
    {
        Task<IEnumerable<BookingResponseDto>> GetAssignedRequestsAsync(int userId);
        Task<BookingResponseDto> GetAssignedRequestByIdAsync(int bookingId, int userId);
        Task<bool> UpdateRequestStatusAsync(int bookingId, int userId, string status, string notes);
        Task<IEnumerable<BookingResponseDto>> GetDailyScheduleAsync(int userId, DateTime? date = null);
        Task<DashboardStatsDto> GetTechnicianDashboardStatsAsync(int userId);
        Task<IEnumerable<TechnicianAvailabilityDto>> GetMyAvailabilityAsync(int userId);
        Task<bool> UpdateMyAvailabilityAsync(int userId, List<TechnicianAvailabilityDto> availabilities);
    }
}
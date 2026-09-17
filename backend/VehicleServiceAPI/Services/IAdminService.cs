using VehicleServiceAPI.DTOs;

namespace VehicleServiceAPI.Services
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(int? centerId = null);

        Task<IEnumerable<UserManagementDto>> GetAllUsersAsync(int? centerId = null, int? currentUserId = null);
        Task<UserManagementDto> GetUserByIdAsync(int userId);
        Task<UserManagementDto> CreateAdminAsync(CreateAdminDto createDto);
        Task<bool> UpdateUserRoleAsync(int userId, UpdateUserRoleDto roleDto);

        Task<IEnumerable<TechnicianManagementDto>> GetAllTechniciansAsync(int? centerId = null);
        Task<TechnicianManagementDto> GetTechnicianByIdAsync(int technicianId);
        Task<TechnicianManagementDto> CreateTechnicianAsync(CreateTechnicianDto createDto);
        Task<TechnicianManagementDto> UpdateTechnicianAsync(int technicianId, UpdateTechnicianDto updateDto);
        Task<bool> DeleteTechnicianAsync(int technicianId);

        Task<IEnumerable<CenterManagementDto>> GetAllCentersAsync();
        Task<CenterManagementDto> GetCenterByIdAsync(int centerId);
        Task<CenterManagementDto> CreateCenterAsync(CreateCenterDto createDto);
        Task<CenterManagementDto> UpdateCenterAsync(int centerId, UpdateCenterDto updateDto);
        Task<bool> DeleteCenterAsync(int centerId);

        Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync(string tableName = null);
        Task<IEnumerable<MonthlyBookingDto>> GetRevenueReportAsync(int? centerId = null);
    }
}
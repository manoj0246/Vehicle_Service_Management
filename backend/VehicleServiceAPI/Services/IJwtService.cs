using VehicleServiceAPI.Models;
namespace VehicleServiceAPI.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        int? GetUserIdFromToken(string token);
        string GetRoleFromToken(string token);
    }
}
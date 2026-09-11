using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterDto registerDto);
        Task<(User user, string token)> LoginAsync(LoginDto loginDto);
        Task<bool> UserExistsAsync(string email);
    }
}
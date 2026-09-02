using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext context,
            IJwtService jwtService,
            ILogger<AuthService> logger)
        {
            _context = context;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<User> RegisterAsync(RegisterDto registerDto)
        {
            // Check if user exists
            if (await UserExistsAsync(registerDto.Email))
            {
                throw new InvalidOperationException("Email already registered");
            }

            // Hash password using BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Role = registerDto.Role ?? "Customer",
                CenterId = registerDto.CenterId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // If role is Technician, create Technician record
            if (user.Role == "Technician" && user.CenterId.HasValue)
            {
                var technician = new Technician
                {
                    UserId = user.Id,
                    CenterId = user.CenterId.Value,
                    Specialization = "General"
                };
                _context.Technicians.Add(technician);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation($"User registered: {user.Email} with role {user.Role}");
            return user;
        }

        public async Task<(User user, string token)> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Verify password using BCrypt
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);

            _logger.LogInformation($"User logged in: {user.Email}");
            return (user, token);
        }

        public async Task<bool> UserExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}
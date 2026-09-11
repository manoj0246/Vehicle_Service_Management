using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;
using VehicleServiceAPI.Services;
using Xunit;

namespace VehicleServiceAPI.Tests
{
    public class AuthTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task RegisterAsync_AlwaysAssignsCustomerRoleAndNullCenterId()
        {
            using var context = CreateDbContext();
            var mockJwt = new Mock<IJwtService>();
            var mockLogger = new Mock<ILogger<AuthService>>();
            var authService = new AuthService(context, mockJwt.Object, mockLogger.Object);

            var registerDto = new RegisterDto
            {
                Name = "John Doe",
                Email = "john@example.com",
                Password = "Password123!"
            };

            var user = await authService.RegisterAsync(registerDto);

            Assert.NotNull(user);
            Assert.Equal("Customer", user.Role);
            Assert.Null(user.CenterId);
            Assert.False(user.IsDeleted);
            Assert.True(BCrypt.Net.BCrypt.Verify("Password123!", user.PasswordHash));
        }

        [Fact]
        public async Task RegisterAsync_ExistingEmail_ThrowsInvalidOperationException()
        {
            using var context = CreateDbContext();
            var mockJwt = new Mock<IJwtService>();
            var mockLogger = new Mock<ILogger<AuthService>>();
            var authService = new AuthService(context, mockJwt.Object, mockLogger.Object);

            context.Users.Add(new User
            {
                Name = "Existing User",
                Email = "existing@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Customer",
                IsDeleted = false
            });
            await context.SaveChangesAsync();

            var registerDto = new RegisterDto
            {
                Name = "Another User",
                Email = "existing@example.com",
                Password = "Password123!"
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => authService.RegisterAsync(registerDto));
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsUserAndToken()
        {
            using var context = CreateDbContext();
            var mockJwt = new Mock<IJwtService>();
            var mockLogger = new Mock<ILogger<AuthService>>();

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!");
            var user = new User
            {
                Id = 1,
                Name = "Alice",
                Email = "alice@example.com",
                PasswordHash = passwordHash,
                Role = "Customer",
                IsDeleted = false
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            mockJwt.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("jwt-token-xyz");

            var authService = new AuthService(context, mockJwt.Object, mockLogger.Object);

            var result = await authService.LoginAsync(new LoginDto
            {
                Email = "alice@example.com",
                Password = "SecurePassword123!"
            });

            Assert.NotNull(result.user);
            Assert.Equal("alice@example.com", result.user.Email);
            Assert.Equal("jwt-token-xyz", result.token);
        }

        [Fact]
        public async Task LoginAsync_SoftDeletedUser_ThrowsUnauthorizedAccessException()
        {
            using var context = CreateDbContext();
            var mockJwt = new Mock<IJwtService>();
            var mockLogger = new Mock<ILogger<AuthService>>();

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!");
            var deletedUser = new User
            {
                Id = 2,
                Name = "Deleted User",
                Email = "deleted@example.com",
                PasswordHash = passwordHash,
                Role = "Customer",
                IsDeleted = true
            };
            context.Users.Add(deletedUser);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, mockJwt.Object, mockLogger.Object);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.LoginAsync(new LoginDto
            {
                Email = "deleted@example.com",
                Password = "SecurePassword123!"
            }));
        }

        [Fact]
        public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAccessException()
        {
            using var context = CreateDbContext();
            var mockJwt = new Mock<IJwtService>();
            var mockLogger = new Mock<ILogger<AuthService>>();

            var user = new User
            {
                Id = 3,
                Name = "Bob",
                Email = "bob@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword!"),
                Role = "Customer",
                IsDeleted = false
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, mockJwt.Object, mockLogger.Object);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.LoginAsync(new LoginDto
            {
                Email = "bob@example.com",
                Password = "WrongPassword!"
            }));
        }
    }
}


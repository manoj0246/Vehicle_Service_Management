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
    public class VehicleTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task CreateVehicleAsync_ValidVehicle_CreatesSuccessfully()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<VehicleService>>();
            var vehicleService = new VehicleService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer", Email = "c@test.com", PasswordHash = "hash", Role = "Customer" };
            context.Users.Add(customer);
            await context.SaveChangesAsync();

            var createDto = new CreateVehicleDto
            {
                Make = "Honda",
                Model = "Civic",
                Year = 2022,
                LicensePlate = "KA-01-AB-1234",
                Color = "Blue"
            };

            var vehicle = await vehicleService.CreateVehicleAsync(1, createDto);

            Assert.NotNull(vehicle);
            Assert.Equal("KA-01-AB-1234", vehicle.LicensePlate);
            Assert.Equal(1, vehicle.CustomerId);
        }

        [Fact]
        public async Task CreateVehicleAsync_SoftDeletedVehicleSameCustomer_RestoresVehicle()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<VehicleService>>();
            var vehicleService = new VehicleService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer", Email = "c@test.com", PasswordHash = "hash", Role = "Customer" };
            var deletedVehicle = new Vehicle
            {
                Id = 1,
                CustomerId = 1,
                Make = "Honda",
                Model = "Civic",
                Year = 2020,
                LicensePlate = "KA-01-AB-9999",
                Color = "Black",
                IsDeleted = true
            };

            context.Users.Add(customer);
            context.Vehicles.Add(deletedVehicle);
            await context.SaveChangesAsync();

            var createDto = new CreateVehicleDto
            {
                Make = "Honda",
                Model = "Civic",
                Year = 2021,
                LicensePlate = "KA-01-AB-9999",
                Color = "Red"
            };

            var restoredVehicle = await vehicleService.CreateVehicleAsync(1, createDto);

            Assert.NotNull(restoredVehicle);
            Assert.Equal("KA-01-AB-9999", restoredVehicle.LicensePlate);
            Assert.Equal("Red", restoredVehicle.Color);

            var dbVehicle = await context.Vehicles.FindAsync(deletedVehicle.Id);
            Assert.False(dbVehicle.IsDeleted);
        }

        [Fact]
        public async Task CreateVehicleAsync_ActiveVehicleSamePlate_ThrowsInvalidOperationException()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<VehicleService>>();
            var vehicleService = new VehicleService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer", Email = "c@test.com", PasswordHash = "hash", Role = "Customer" };
            var activeVehicle = new Vehicle
            {
                Id = 1,
                CustomerId = 1,
                Make = "Honda",
                Model = "Civic",
                Year = 2020,
                LicensePlate = "KA-01-AB-1111",
                Color = "White",
                IsDeleted = false
            };

            context.Users.Add(customer);
            context.Vehicles.Add(activeVehicle);
            await context.SaveChangesAsync();

            var createDto = new CreateVehicleDto
            {
                Make = "Toyota",
                Model = "Corolla",
                Year = 2021,
                LicensePlate = "KA-01-AB-1111",
                Color = "Silver"
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                vehicleService.CreateVehicleAsync(1, createDto));

            Assert.Contains("already registered in the system", ex.Message);
        }

        [Fact]
        public async Task DeleteVehicleAsync_ActiveBookings_ThrowsInvalidOperationException()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<VehicleService>>();
            var vehicleService = new VehicleService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer", Email = "c@test.com", PasswordHash = "hash", Role = "Customer" };
            var vehicle = new Vehicle { Id = 1, CustomerId = 1, Make = "Honda", Model = "Civic", Year = 2020, LicensePlate = "KA-01-AB-2222", IsDeleted = false };
            var activeBooking = new ServiceRequest
            {
                Id = 1,
                CustomerId = 1,
                VehicleId = 1,
                ServiceId = 1,
                ScheduledDate = DateTime.UtcNow.AddDays(1),
                Status = "Confirmed"
            };

            context.Users.Add(customer);
            context.Vehicles.Add(vehicle);
            context.ServiceRequests.Add(activeBooking);
            await context.SaveChangesAsync();

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                vehicleService.DeleteVehicleAsync(1, 1));

            Assert.Contains("Cannot delete vehicle with active service requests", ex.Message);
        }

        [Fact]
        public async Task DeleteVehicleAsync_NoActiveBookings_SoftDeletesSuccessfully()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<VehicleService>>();
            var vehicleService = new VehicleService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer", Email = "c@test.com", PasswordHash = "hash", Role = "Customer" };
            var vehicle = new Vehicle { Id = 1, CustomerId = 1, Make = "Honda", Model = "Civic", Year = 2020, LicensePlate = "KA-01-AB-3333", IsDeleted = false };

            context.Users.Add(customer);
            context.Vehicles.Add(vehicle);
            await context.SaveChangesAsync();

            var result = await vehicleService.DeleteVehicleAsync(1, 1);

            Assert.True(result);
            var dbVehicle = await context.Vehicles.FindAsync(1);
            Assert.True(dbVehicle.IsDeleted);
        }
    }
}


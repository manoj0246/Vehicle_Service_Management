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
    public class BookingSchedulingTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task BookServiceAsync_OverlappingTimeSlotSameVehicle_ThrowsInvalidOperationException()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<BookingService>>();
            var bookingService = new BookingService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer A", Email = "a@test.com", PasswordHash = "hash", Role = "Customer" };
            var vehicle = new Vehicle { Id = 1, CustomerId = 1, Make = "Toyota", Model = "Corolla", Year = 2020, LicensePlate = "ABC-123" };
            var center = new ServiceCenter { Id = 1, Name = "Main Hub", Address = "123 St", Phone = "1234567890", IsDeleted = false };
            var service = new Service { Id = 1, CenterId = 1, Name = "Oil Change", Price = 50, DurationMinutes = 60, IsDeleted = false };

            var tomorrow9am = DateTime.UtcNow.Date.AddDays(1).AddHours(9);

            var existingBooking = new ServiceRequest
            {
                Id = 1,
                CustomerId = 1,
                VehicleId = 1,
                ServiceId = 1,
                ScheduledDate = tomorrow9am,
                Status = "Confirmed",
                Service = service,
                Vehicle = vehicle,
                Customer = customer
            };

            context.Users.Add(customer);
            context.Vehicles.Add(vehicle);
            context.ServiceCenters.Add(center);
            context.Services.Add(service);
            context.ServiceRequests.Add(existingBooking);
            await context.SaveChangesAsync();

            // Attempt booking at 09:30 for 60 mins on the same vehicle (overlaps with 09:00 - 10:00)
            var clashRequest = new BookingRequestDto
            {
                VehicleId = 1,
                ServiceId = 1,
                ScheduledDate = tomorrow9am.AddMinutes(30),
                Notes = "Clash booking"
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                bookingService.BookServiceAsync(1, clashRequest));

            Assert.Contains("active booking during this time slot", ex.Message);
        }

        [Fact]
        public async Task BookServiceAsync_NonOverlappingTimeSlotSameVehicle_Succeeds()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<BookingService>>();
            var bookingService = new BookingService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer A", Email = "a@test.com", PasswordHash = "hash", Role = "Customer" };
            var vehicle = new Vehicle { Id = 1, CustomerId = 1, Make = "Toyota", Model = "Corolla", Year = 2020, LicensePlate = "ABC-123" };
            var center = new ServiceCenter { Id = 1, Name = "Main Hub", Address = "123 St", Phone = "1234567890", IsDeleted = false };
            var service = new Service { Id = 1, CenterId = 1, Name = "Oil Change", Price = 50, DurationMinutes = 60, IsDeleted = false };

            var tomorrow9am = DateTime.UtcNow.Date.AddDays(1).AddHours(9);

            var existingBooking = new ServiceRequest
            {
                Id = 1,
                CustomerId = 1,
                VehicleId = 1,
                ServiceId = 1,
                ScheduledDate = tomorrow9am,
                Status = "Confirmed",
                Service = service,
                Vehicle = vehicle,
                Customer = customer
            };

            context.Users.Add(customer);
            context.Vehicles.Add(vehicle);
            context.ServiceCenters.Add(center);
            context.Services.Add(service);
            context.ServiceRequests.Add(existingBooking);
            await context.SaveChangesAsync();

            // Booking at 10:00 for 60 mins on the same vehicle (adjacent, does not overlap)
            var nextRequest = new BookingRequestDto
            {
                VehicleId = 1,
                ServiceId = 1,
                ScheduledDate = tomorrow9am.AddHours(1),
                Notes = "Back to back booking"
            };

            var result = await bookingService.BookServiceAsync(1, nextRequest);

            Assert.NotNull(result);
            Assert.Equal("Pending", result.Status);
            Assert.Equal(1, result.VehicleId);
        }

        [Fact]
        public async Task IsTechnicianAvailableAsync_OutsideShiftWindow_ReturnsFalse()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<BookingService>>();
            var bookingService = new BookingService(context, mockLogger.Object);

            var techUser = new User { Id = 10, Name = "Tech Bob", Email = "bob@tech.com", PasswordHash = "hash", Role = "Technician" };
            var technician = new Technician { Id = 1, UserId = 10, CenterId = 1, Specialization = "Mechanic", IsDeleted = false };

            // Find next Monday
            var daysUntilMonday = ((int)DayOfWeek.Monday - (int)DateTime.UtcNow.DayOfWeek + 7) % 7;
            if (daysUntilMonday == 0) daysUntilMonday = 7;
            var targetMonday = DateTime.UtcNow.Date.AddDays(daysUntilMonday);

            var shift = new TechnicianAvailability
            {
                Id = 1,
                TechnicianId = 1,
                DayOfWeek = DayOfWeek.Monday,
                StartTime = new TimeSpan(9, 0, 0),
                EndTime = new TimeSpan(17, 0, 0) // shift ends at 17:00
            };

            context.Users.Add(techUser);
            context.Technicians.Add(technician);
            context.TechnicianAvailabilities.Add(shift);
            await context.SaveChangesAsync();

            // 60-minute service starting at 16:30 Monday will end at 17:30 (exceeds 17:00 shift)
            var scheduledDate = targetMonday.AddHours(16).AddMinutes(30);
            var isAvailable = await bookingService.IsTechnicianAvailableAsync(1, scheduledDate, 60);

            Assert.False(isAvailable);
        }

        [Fact]
        public async Task IsTechnicianAvailableAsync_WithinShiftAndNoOverlap_ReturnsTrue()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<BookingService>>();
            var bookingService = new BookingService(context, mockLogger.Object);

            var techUser = new User { Id = 10, Name = "Tech Bob", Email = "bob@tech.com", PasswordHash = "hash", Role = "Technician" };
            var technician = new Technician { Id = 1, UserId = 10, CenterId = 1, Specialization = "Mechanic", IsDeleted = false };

            var daysUntilMonday = ((int)DayOfWeek.Monday - (int)DateTime.UtcNow.DayOfWeek + 7) % 7;
            if (daysUntilMonday == 0) daysUntilMonday = 7;
            var targetMonday = DateTime.UtcNow.Date.AddDays(daysUntilMonday);

            var shift = new TechnicianAvailability
            {
                Id = 1,
                TechnicianId = 1,
                DayOfWeek = DayOfWeek.Monday,
                StartTime = new TimeSpan(9, 0, 0),
                EndTime = new TimeSpan(17, 0, 0)
            };

            context.Users.Add(techUser);
            context.Technicians.Add(technician);
            context.TechnicianAvailabilities.Add(shift);
            await context.SaveChangesAsync();

            // 60-minute service starting at 10:00 Monday ends at 11:00 (within shift)
            var scheduledDate = targetMonday.AddHours(10);
            var isAvailable = await bookingService.IsTechnicianAvailableAsync(1, scheduledDate, 60);

            Assert.True(isAvailable);
        }

        [Fact]
        public async Task BookServiceAsync_PastDate_ThrowsInvalidOperationException()
        {
            using var context = CreateDbContext();
            var mockLogger = new Mock<ILogger<BookingService>>();
            var bookingService = new BookingService(context, mockLogger.Object);

            var customer = new User { Id = 1, Name = "Customer A", Email = "a@test.com", PasswordHash = "hash", Role = "Customer" };
            var vehicle = new Vehicle { Id = 1, CustomerId = 1, Make = "Toyota", Model = "Corolla", Year = 2020, LicensePlate = "ABC-123" };
            var center = new ServiceCenter { Id = 1, Name = "Main Hub", Address = "123 St", Phone = "1234567890", IsDeleted = false };
            var service = new Service { Id = 1, CenterId = 1, Name = "Oil Change", Price = 50, DurationMinutes = 60, IsDeleted = false };

            context.Users.Add(customer);
            context.Vehicles.Add(vehicle);
            context.ServiceCenters.Add(center);
            context.Services.Add(service);
            await context.SaveChangesAsync();

            var pastRequest = new BookingRequestDto
            {
                VehicleId = 1,
                ServiceId = 1,
                ScheduledDate = DateTime.UtcNow.AddHours(-2),
                Notes = "Past appointment"
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                bookingService.BookServiceAsync(1, pastRequest));

            Assert.Contains("Cannot book services in the past", ex.Message);
        }
    }
}


using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VehicleService> _logger;

        public VehicleService(ApplicationDbContext context, ILogger<VehicleService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByCustomerAsync(int customerId)
        {
            var vehicles = await _context.Vehicles
                .Include(v => v.Customer)
                .Where(v => v.CustomerId == customerId && !v.IsDeleted)
                .OrderBy(v => v.Make)
                .ThenBy(v => v.Model)
                .ToListAsync();

            return vehicles.Select(MapToDto);
        }

        public async Task<VehicleDto> GetVehicleByIdAsync(int id, int customerId)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.Customer)
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);

            if (vehicle == null)
                throw new KeyNotFoundException($"Vehicle with ID {id} not found");

            if (vehicle.CustomerId != customerId)
                throw new UnauthorizedAccessException("You don't own this vehicle");

            return MapToDto(vehicle);
        }

        public async Task<VehicleDto> CreateVehicleAsync(int customerId, CreateVehicleDto createDto)
        {
            var existingVehicle = await _context.Vehicles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.LicensePlate == createDto.LicensePlate);

            if (existingVehicle != null)
            {
                if (existingVehicle.IsDeleted && existingVehicle.CustomerId == customerId)
                {
                    existingVehicle.Make = createDto.Make;
                    existingVehicle.Model = createDto.Model;
                    existingVehicle.Year = createDto.Year;
                    existingVehicle.Color = createDto.Color;
                    existingVehicle.IsDeleted = false;

                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Vehicle {existingVehicle.LicensePlate} restored for customer {customerId}");
                    return await GetVehicleByIdAsync(existingVehicle.Id, customerId);
                }

                throw new InvalidOperationException("This license plate is already registered in the system");
            }

            var vehicle = new Vehicle
            {
                CustomerId = customerId,
                Make = createDto.Make,
                Model = createDto.Model,
                Year = createDto.Year,
                LicensePlate = createDto.LicensePlate,
                Color = createDto.Color,
                IsDeleted = false
            };

            try
            {
                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("This license plate is already registered in the system");
            }

            _logger.LogInformation($"Vehicle {vehicle.LicensePlate} created for customer {customerId}");

            return await GetVehicleByIdAsync(vehicle.Id, customerId);
        }

        public async Task<VehicleDto> UpdateVehicleAsync(int id, int customerId, UpdateVehicleDto updateDto)
        {
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);

            if (vehicle == null)
                throw new KeyNotFoundException($"Vehicle with ID {id} not found");

            if (vehicle.CustomerId != customerId)
                throw new UnauthorizedAccessException("You don't own this vehicle");

            if (vehicle.LicensePlate != updateDto.LicensePlate)
            {
                var existingVehicle = await _context.Vehicles
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(v => v.LicensePlate == updateDto.LicensePlate && v.Id != id);

                if (existingVehicle != null)
                    throw new InvalidOperationException("This license plate is already registered in the system");
            }

            vehicle.Make = updateDto.Make;
            vehicle.Model = updateDto.Model;
            vehicle.Year = updateDto.Year;
            vehicle.LicensePlate = updateDto.LicensePlate;
            vehicle.Color = updateDto.Color;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("This license plate is already registered in the system");
            }

            _logger.LogInformation($"Vehicle {vehicle.LicensePlate} updated");

            return await GetVehicleByIdAsync(id, customerId);
        }

        public async Task<bool> DeleteVehicleAsync(int id, int customerId)
        {
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);

            if (vehicle == null)
                throw new KeyNotFoundException($"Vehicle with ID {id} not found");

            if (vehicle.CustomerId != customerId)
                throw new UnauthorizedAccessException("You don't own this vehicle");

            var hasActiveRequests = await _context.ServiceRequests
                .AnyAsync(sr => sr.VehicleId == id && sr.Status != "Completed" && sr.Status != "Cancelled");

            if (hasActiveRequests)
                throw new InvalidOperationException("Cannot delete vehicle with active service requests");

            vehicle.IsDeleted = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Vehicle {vehicle.LicensePlate} deleted (soft delete)");

            return true;
        }

        public async Task<bool> VehicleExistsAsync(int id, int customerId)
        {
            return await _context.Vehicles
                .AnyAsync(v => v.Id == id && v.CustomerId == customerId && !v.IsDeleted);
        }

        private static VehicleDto MapToDto(Vehicle vehicle)
        {
            return new VehicleDto
            {
                Id = vehicle.Id,
                CustomerId = vehicle.CustomerId,
                CustomerName = vehicle.Customer?.Name ?? "Unknown",
                Make = vehicle.Make,
                Model = vehicle.Model,
                Year = vehicle.Year,
                LicensePlate = vehicle.LicensePlate,
                Color = vehicle.Color
            };
        }
    }
}
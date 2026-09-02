using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class ServiceCatalogService : IServiceCatalogService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ServiceCatalogService> _logger;

        public ServiceCatalogService(ApplicationDbContext context, ILogger<ServiceCatalogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ServiceResponseDto>> GetAllServicesAsync(int? centerId = null)
        {
            var query = _context.Services
                .Include(s => s.Center)
                .Where(s => !s.IsDeleted);

            if (centerId.HasValue)
            {
                query = query.Where(s => s.CenterId == centerId.Value);
            }

            var services = await query
                .OrderBy(s => s.Name)
                .ToListAsync();

            return services.Select(MapToDto);
        }

        public async Task<ServiceResponseDto> GetServiceByIdAsync(int id)
        {
            var service = await _context.Services
                .Include(s => s.Center)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (service == null)
                throw new KeyNotFoundException($"Service with ID {id} not found");

            return MapToDto(service);
        }

        public async Task<ServiceResponseDto> CreateServiceAsync(CreateServiceDto dto)
        {
            var centerExists = await _context.ServiceCenters
                .AnyAsync(c => c.Id == dto.CenterId && !c.IsDeleted);

            if (!centerExists)
                throw new InvalidOperationException($"Service Center with ID {dto.CenterId} does not exist");

            var service = new Service
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DurationMinutes = dto.DurationMinutes,
                CenterId = dto.CenterId,
                IsDeleted = false
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service {service.Name} created under Center {dto.CenterId}");

            return await GetServiceByIdAsync(service.Id);
        }

        public async Task<ServiceResponseDto> UpdateServiceAsync(int id, UpdateServiceDto dto)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (service == null)
                throw new KeyNotFoundException($"Service with ID {id} not found");

            service.Name = dto.Name;
            service.Description = dto.Description;
            service.Price = dto.Price;
            service.DurationMinutes = dto.DurationMinutes;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service {id} updated");

            return await GetServiceByIdAsync(id);
        }

        public async Task<bool> DeleteServiceAsync(int id)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (service == null)
                throw new KeyNotFoundException($"Service with ID {id} not found");

            var hasActiveBookings = await _context.ServiceRequests
                .AnyAsync(sr => sr.ServiceId == id && sr.Status != "Completed" && sr.Status != "Cancelled");

            if (hasActiveBookings)
                throw new InvalidOperationException("Cannot delete service with active bookings");

            service.IsDeleted = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service {id} soft deleted");

            return true;
        }

        private static ServiceResponseDto MapToDto(Service service)
        {
            return new ServiceResponseDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                DurationMinutes = service.DurationMinutes,
                CenterId = service.CenterId,
                CenterName = service.Center?.Name ?? "Unknown Center"
            };
        }
    }
}


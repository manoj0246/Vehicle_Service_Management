using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class CenterService : ICenterService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CenterService> _logger;

        public CenterService(ApplicationDbContext context, ILogger<CenterService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CenterResponseDto>> GetAllCentersAsync()
        {
            var centers = await _context.ServiceCenters
                .Include(c => c.Services.Where(s => !s.IsDeleted))
                .Include(c => c.Technicians.Where(t => !t.IsDeleted))
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return centers.Select(MapToDto);
        }

        public async Task<CenterResponseDto> GetCenterByIdAsync(int id)
        {
            var center = await _context.ServiceCenters
                .Include(c => c.Services.Where(s => !s.IsDeleted))
                .Include(c => c.Technicians.Where(t => !t.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service Center with ID {id} not found");

            return MapToDto(center);
        }

        public async Task<CenterResponseDto> CreateCenterAsync(CreateCenterDto dto)
        {
            var existingCenter = await _context.ServiceCenters
                .FirstOrDefaultAsync(c => c.Name.ToLower() == dto.Name.ToLower() && !c.IsDeleted);

            if (existingCenter != null)
                throw new InvalidOperationException($"Service Center with name '{dto.Name}' already exists");

            var center = new ServiceCenter
            {
                Name = dto.Name,
                Address = dto.Address,
                Phone = dto.Phone,
                IsDeleted = false
            };

            _context.ServiceCenters.Add(center);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service Center '{center.Name}' created with ID {center.Id}");

            return await GetCenterByIdAsync(center.Id);
        }

        public async Task<CenterResponseDto> UpdateCenterAsync(int id, UpdateCenterDto dto)
        {
            var center = await _context.ServiceCenters
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service Center with ID {id} not found");

            center.Name = dto.Name;
            center.Address = dto.Address;
            center.Phone = dto.Phone;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service Center {id} updated");

            return await GetCenterByIdAsync(id);
        }

        private static CenterResponseDto MapToDto(ServiceCenter center)
        {
            return new CenterResponseDto
            {
                Id = center.Id,
                Name = center.Name,
                Address = center.Address,
                Phone = center.Phone,
                ActiveServicesCount = center.Services?.Count ?? 0,
                ActiveTechniciansCount = center.Technicians?.Count ?? 0
            };
        }
    }
}


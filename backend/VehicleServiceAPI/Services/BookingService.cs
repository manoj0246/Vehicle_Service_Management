using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BookingService> _logger;

        private static readonly Dictionary<string, List<string>> _validTransitions = new()
        {
            ["Pending"] = new() { "Confirmed", "Cancelled" },
            ["Confirmed"] = new() { "InProgress", "Cancelled" },
            ["InProgress"] = new() { "Completed" },
            ["Completed"] = new() { },
            ["Cancelled"] = new() { }
        };

        public BookingService(ApplicationDbContext context, ILogger<BookingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        private static DateTime EnsureUtc(DateTime dt)
        {
            return dt.Kind switch
            {
                DateTimeKind.Utc => dt,
                DateTimeKind.Unspecified => DateTime.SpecifyKind(dt, DateTimeKind.Utc),
                _ => dt.ToUniversalTime()
            };
        }

        public async Task<BookingResponseDto> BookServiceAsync(int customerId, BookingRequestDto request)
        {
            if (!await ValidateVehicleOwnershipAsync(request.VehicleId, customerId))
                throw new UnauthorizedAccessException("You can only book services for your own vehicles");

            var service = await _context.Services
                .Include(s => s.Center)
                .FirstOrDefaultAsync(s => s.Id == request.ServiceId && !s.IsDeleted);

            if (service == null)
                throw new KeyNotFoundException($"Service with ID {request.ServiceId} not found");

            var scheduledUtc = EnsureUtc(request.ScheduledDate);

            if (scheduledUtc < DateTime.UtcNow)
                throw new InvalidOperationException("Cannot book services in the past");

            var vehicleConflict = await _context.ServiceRequests
                .AnyAsync(sr => sr.VehicleId == request.VehicleId
                    && sr.ScheduledDate == scheduledUtc
                    && sr.Status != "Completed"
                    && sr.Status != "Cancelled");

            if (vehicleConflict)
                throw new InvalidOperationException("This vehicle already has a booking at the selected time");

            if (request.TechnicianId.HasValue)
            {
                var isAvailable = await IsTechnicianAvailableAsync(
                    request.TechnicianId.Value,
                    scheduledUtc);

                if (!isAvailable)
                    throw new InvalidOperationException("Selected technician is not available at this time");
            }

            var booking = new ServiceRequest
            {
                CustomerId = customerId,
                VehicleId = request.VehicleId,
                ServiceId = request.ServiceId,
                TechnicianId = request.TechnicianId,
                ScheduledDate = scheduledUtc,
                Status = request.TechnicianId.HasValue ? "Confirmed" : "Pending",
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceRequests.Add(booking);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Booking created: ID {booking.Id}, Customer {customerId}, Status {booking.Status}");

            return await MapToBookingResponse(booking);
        }

        public async Task<IEnumerable<BookingResponseDto>> GetUpcomingBookingsAsync(int customerId)
        {
            var nowUtc = DateTime.UtcNow;
            var bookings = await _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .Where(sr => sr.CustomerId == customerId
                    && sr.ScheduledDate >= nowUtc
                    && sr.Status != "Completed"
                    && sr.Status != "Cancelled")
                .OrderBy(sr => sr.ScheduledDate)
                .ToListAsync();

            var dtos = new List<BookingResponseDto>();
            foreach (var booking in bookings)
            {
                dtos.Add(await MapToBookingResponse(booking));
            }
            return dtos;
        }

        public async Task<IEnumerable<BookingResponseDto>> GetBookingHistoryAsync(int customerId, BookingFilterDto filters)
        {
            IQueryable<ServiceRequest> query = _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .Where(sr => sr.CustomerId == customerId);

            if (filters.FromDate.HasValue)
            {
                var fromUtc = EnsureUtc(filters.FromDate.Value);
                query = query.Where(sr => sr.ScheduledDate >= fromUtc);
            }

            if (filters.ToDate.HasValue)
            {
                var toUtc = EnsureUtc(filters.ToDate.Value);
                query = query.Where(sr => sr.ScheduledDate <= toUtc);
            }

            if (!string.IsNullOrEmpty(filters.Status))
                query = query.Where(sr => sr.Status == filters.Status);

            if (filters.ServiceId.HasValue)
                query = query.Where(sr => sr.ServiceId == filters.ServiceId.Value);

            var pageNumber = filters.Page > 0 ? filters.Page : 1;
            var pageSize = filters.PageSize > 0 ? filters.PageSize : 10;

            var bookings = await query
                .OrderByDescending(sr => sr.ScheduledDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = new List<BookingResponseDto>();
            foreach (var booking in bookings)
            {
                dtos.Add(await MapToBookingResponse(booking));
            }
            return dtos;
        }

        public async Task<BookingResponseDto> GetBookingByIdAsync(int bookingId, int customerId)
        {
            var booking = await _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(sr => sr.Id == bookingId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            if (booking.CustomerId != customerId)
                throw new UnauthorizedAccessException("You don't own this booking");

            return await MapToBookingResponse(booking);
        }

        public async Task<bool> CancelBookingAsync(int bookingId, int customerId)
        {
            var booking = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.Id == bookingId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            if (booking.CustomerId != customerId)
                throw new UnauthorizedAccessException("You don't own this booking");

            if (booking.Status == "Completed")
                throw new InvalidOperationException("Cannot cancel a completed service");

            if (booking.Status == "Cancelled")
                throw new InvalidOperationException("Booking is already cancelled");

            if (booking.ScheduledDate < DateTime.UtcNow)
                throw new InvalidOperationException("Cannot cancel a past appointment");

            if (booking.Status != "Pending" && booking.Status != "Confirmed")
                throw new InvalidOperationException($"Cannot cancel booking with status: {booking.Status}");

            booking.Status = "Cancelled";
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Booking {bookingId} cancelled by customer {customerId}");

            return true;
        }

        public async Task<string> GetBookingStatusAsync(int bookingId, int customerId)
        {
            var booking = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.Id == bookingId && sr.CustomerId == customerId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            return booking.Status;
        }

        public async Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync(BookingFilterDto filters)
        {
            IQueryable<ServiceRequest> query = _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .Include(sr => sr.Customer);

            if (filters.FromDate.HasValue)
            {
                var fromUtc = EnsureUtc(filters.FromDate.Value);
                query = query.Where(sr => sr.ScheduledDate >= fromUtc);
            }

            if (filters.ToDate.HasValue)
            {
                var toUtc = EnsureUtc(filters.ToDate.Value);
                query = query.Where(sr => sr.ScheduledDate <= toUtc);
            }

            if (!string.IsNullOrEmpty(filters.Status))
                query = query.Where(sr => sr.Status == filters.Status);

            if (filters.ServiceId.HasValue)
                query = query.Where(sr => sr.ServiceId == filters.ServiceId.Value);

            if (filters.TechnicianId.HasValue)
                query = query.Where(sr => sr.TechnicianId == filters.TechnicianId.Value);

            var pageNumber = filters.Page > 0 ? filters.Page : 1;
            var pageSize = filters.PageSize > 0 ? filters.PageSize : 10;

            var bookings = await query
                .OrderByDescending(sr => sr.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = new List<BookingResponseDto>();
            foreach (var booking in bookings)
            {
                dtos.Add(await MapToBookingResponse(booking));
            }
            return dtos;
        }

        public async Task<bool> AssignTechnicianAsync(int bookingId, int technicianId)
        {
            var booking = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.Id == bookingId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            if (booking.Status == "Completed" || booking.Status == "Cancelled")
                throw new InvalidOperationException($"Cannot assign technician to {booking.Status} booking");

            var scheduledUtc = EnsureUtc(booking.ScheduledDate);
            var isAvailable = await IsTechnicianAvailableAsync(technicianId, scheduledUtc);
            if (!isAvailable)
                throw new InvalidOperationException("Technician is not available at this time");

            booking.TechnicianId = technicianId;
            booking.Status = "Confirmed";
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Technician {technicianId} assigned to booking {bookingId}");

            return true;
        }

        public async Task<bool> UpdateBookingStatusAsync(int bookingId, string status, string notes, string role, int userId)
        {
            var booking = await _context.ServiceRequests
                .Include(sr => sr.Technician)
                .FirstOrDefaultAsync(sr => sr.Id == bookingId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            if (role == "Technician")
            {
                var technician = await _context.Technicians.FirstOrDefaultAsync(t => t.UserId == userId);
                if (technician == null || booking.TechnicianId != technician.Id)
                    throw new UnauthorizedAccessException("You can only update your own assigned services");
            }
            else if (role != "Admin" && role != "SuperAdmin")
            {
                throw new UnauthorizedAccessException("Only Admins and Technicians can update status");
            }

            if (!_validTransitions.ContainsKey(booking.Status))
                throw new InvalidOperationException($"Invalid current status: {booking.Status}");

            if (!_validTransitions[booking.Status].Contains(status))
                throw new InvalidOperationException($"Cannot transition from {booking.Status} to {status}");

            booking.Status = status;
            booking.Notes = string.IsNullOrEmpty(notes) ? booking.Notes : notes;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Booking {bookingId} status updated to {status} by {role} {userId}");

            return true;
        }

        public async Task<bool> IsTechnicianAvailableAsync(int technicianId, DateTime scheduledDate)
        {
            var technician = await _context.Technicians
                .FirstOrDefaultAsync(t => t.Id == technicianId && !t.IsDeleted);

            if (technician == null)
                return false;

            var scheduledUtc = EnsureUtc(scheduledDate);
            var dayOfWeek = scheduledUtc.DayOfWeek;
            var timeOfDay = scheduledUtc.TimeOfDay;

            var availability = await _context.TechnicianAvailabilities
                .FirstOrDefaultAsync(a => a.TechnicianId == technicianId
                    && a.DayOfWeek == dayOfWeek
                    && timeOfDay >= a.StartTime
                    && timeOfDay <= a.EndTime);

            if (availability == null)
                return false;

            var existingBooking = await _context.ServiceRequests
                .AnyAsync(sr => sr.TechnicianId == technicianId
                    && sr.ScheduledDate == scheduledUtc
                    && sr.Status != "Completed"
                    && sr.Status != "Cancelled");

            return !existingBooking;
        }

        public async Task<bool> ValidateVehicleOwnershipAsync(int vehicleId, int customerId)
        {
            return await _context.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.CustomerId == customerId && !v.IsDeleted);
        }

        private async Task<BookingResponseDto> MapToBookingResponse(ServiceRequest booking)
        {
            var vehicle = await _context.Vehicles.FindAsync(booking.VehicleId);
            var service = await _context.Services.FindAsync(booking.ServiceId);
            var customer = await _context.Users.FindAsync(booking.CustomerId);

            string technicianName = "Not Assigned";
            if (booking.TechnicianId.HasValue)
            {
                var tech = await _context.Technicians
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == booking.TechnicianId.Value);
                if (tech?.User != null)
                {
                    technicianName = tech.User.Name;
                }
            }

            return new BookingResponseDto
            {
                Id = booking.Id,
                CustomerId = booking.CustomerId,
                CustomerName = customer?.Name ?? "Unknown",
                VehicleId = booking.VehicleId,
                VehicleName = vehicle != null ? $"{vehicle.Make} {vehicle.Model}" : "Unknown",
                LicensePlate = vehicle?.LicensePlate ?? "Unknown",
                ServiceId = booking.ServiceId,
                ServiceName = service?.Name ?? "Unknown",
                ServicePrice = service?.Price ?? 0,
                TechnicianId = booking.TechnicianId,
                TechnicianName = technicianName,
                ScheduledDate = booking.ScheduledDate,
                Status = booking.Status,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt,
                UpdatedAt = booking.UpdatedAt
            };
        }
    }
}
using VehicleServiceAPI.DTOs;

namespace VehicleServiceAPI.Services
{
    public interface IBookingService
    {
        Task<BookingResponseDto> BookServiceAsync(int customerId, BookingRequestDto request);
        Task<IEnumerable<BookingResponseDto>> GetUpcomingBookingsAsync(int customerId);
        Task<IEnumerable<BookingResponseDto>> GetBookingHistoryAsync(int customerId, BookingFilterDto filters);
        Task<BookingResponseDto> GetBookingByIdAsync(int bookingId, int customerId);
        Task<bool> CancelBookingAsync(int bookingId, int customerId);
        Task<string> GetBookingStatusAsync(int bookingId, int customerId);

        Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync(BookingFilterDto filters, int? centerId = null);
        Task<bool> AssignTechnicianAsync(int bookingId, int technicianId);
        Task<bool> UpdateBookingStatusAsync(int bookingId, string status, string notes, string role, int userId);

        Task<bool> IsTechnicianAvailableAsync(int technicianId, DateTime scheduledDate, int durationMinutes);
        Task<bool> ValidateVehicleOwnershipAsync(int vehicleId, int customerId);
    }
}
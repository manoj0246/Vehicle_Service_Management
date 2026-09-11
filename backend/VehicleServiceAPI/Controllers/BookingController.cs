using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Services;

namespace VehicleServiceAPI.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly ILogger<BookingController> _logger;

        public BookingController(IBookingService bookingService, ILogger<BookingController> logger)
        {
            _bookingService = bookingService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
            return int.Parse(userIdClaim);
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "Customer";
        }

        [HttpPost]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> BookService([FromBody] BookingRequestDto request)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var booking = await _bookingService.BookServiceAsync(customerId, request);

                return CreatedAtAction(
                    nameof(GetBookingById),
                    new { id = booking.Id },
                    new
                    {
                        success = true,
                        message = "Booking created successfully",
                        data = booking
                    }
                );
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("upcoming")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetUpcomingBookings()
        {
            try
            {
                var customerId = GetCurrentUserId();
                var bookings = await _bookingService.GetUpcomingBookingsAsync(customerId);

                return Ok(new
                {
                    success = true,
                    count = bookings.Count(),
                    data = bookings
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming bookings");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("history")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetBookingHistory([FromQuery] BookingFilterDto filters)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var bookings = await _bookingService.GetBookingHistoryAsync(customerId, filters);

                return Ok(new
                {
                    success = true,
                    count = bookings.Count(),
                    data = bookings
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking history");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var booking = await _bookingService.GetBookingByIdAsync(id, customerId);

                return Ok(new
                {
                    success = true,
                    data = booking
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting booking {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("{id}/cancel")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                var customerId = GetCurrentUserId();
                await _bookingService.CancelBookingAsync(id, customerId);

                return Ok(new
                {
                    success = true,
                    message = "Booking cancelled successfully"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling booking {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("{id}/status")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetBookingStatus(int id)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var status = await _bookingService.GetBookingStatusAsync(id, customerId);

                return Ok(new
                {
                    success = true,
                    bookingId = id,
                    status = status
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting status for booking {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("all")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filters)
        {
            try
            {
                var bookings = await _bookingService.GetAllBookingsAsync(filters);

                return Ok(new
                {
                    success = true,
                    count = bookings.Count(),
                    data = bookings
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all bookings");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("{id}/assign")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AssignTechnician(int id, [FromBody] int technicianId)
        {
            try
            {
                await _bookingService.AssignTechnicianAsync(id, technicianId);

                return Ok(new
                {
                    success = true,
                    message = "Technician assigned successfully"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning technician to booking {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "AdminOrTechnician")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] BookingStatusUpdateDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var role = GetCurrentUserRole();

                await _bookingService.UpdateBookingStatusAsync(id, updateDto.Status, updateDto.Notes, role, userId);

                return Ok(new
                {
                    success = true,
                    message = $"Status updated to {updateDto.Status} successfully"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating status for booking {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }
    }
}
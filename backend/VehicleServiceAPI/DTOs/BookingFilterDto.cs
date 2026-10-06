using System.ComponentModel.DataAnnotations;

namespace VehicleServiceAPI.DTOs
{
    public class BookingFilterDto
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Status { get; set; }
        public int? ServiceId { get; set; }
        public int? TechnicianId { get; set; }

        [Range(1, 10000, ErrorMessage = "Page must be between 1 and 10000")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100")]
        public int PageSize { get; set; } = 10;
    }
}
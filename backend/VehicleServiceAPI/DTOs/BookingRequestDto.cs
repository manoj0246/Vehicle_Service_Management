using System.ComponentModel.DataAnnotations;
namespace VehicleServiceAPI.DTOs
{
    public class BookingRequestDto
    {
        [Required(ErrorMessage = "Vehicle ID is required")]
        public int VehicleId { get; set; }

        [Required(ErrorMessage = "Service ID is required")]
        public int ServiceId { get; set; }

        public int? TechnicianId { get; set; }
        [Required(ErrorMessage = "Scheduled date is required")]
        public DateTime ScheduledDate { get; set; }
        public string Notes { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;
namespace VehicleServiceAPI.DTOs
{
    public class BookingStatusUpdateDto
    {
        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; }
        public string Notes { get; set; }
    }
}
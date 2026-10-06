using System.ComponentModel.DataAnnotations;

namespace VehicleServiceAPI.DTOs
{
    public class CreateServiceDto
    {
        [Required(ErrorMessage = "Service name is required")]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, 100000.0, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Duration in minutes is required")]
        [Range(1, 1440, ErrorMessage = "Duration must be between 1 and 1440 minutes")]
        public int DurationMinutes { get; set; }

        [Required(ErrorMessage = "Center ID is required")]
        public int CenterId { get; set; }
    }
}


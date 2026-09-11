using System.ComponentModel.DataAnnotations;

namespace VehicleServiceAPI.DTOs
{
    public class CreateCenterDto
    {
        [Required(ErrorMessage = "Center name is required")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; }
    }
}


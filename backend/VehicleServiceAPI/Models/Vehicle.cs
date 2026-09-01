using System.Collections.Generic;

namespace VehicleServiceAPI.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public string LicensePlate { get; set; }
        public string Color { get; set; }
        public bool IsDeleted { get; set; }

        public User Customer { get; set; }
        public ICollection<ServiceRequest> ServiceRequests { get; set; }
    }
}
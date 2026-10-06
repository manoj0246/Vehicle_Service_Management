using System.Collections.Generic;

namespace VehicleServiceAPI.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public int CenterId { get; set; }
        public bool IsDeleted { get; set; }

        public ServiceCenter Center { get; set; }
        public ICollection<ServiceRequest> ServiceRequests { get; set; }
    }
}
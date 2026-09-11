using System.Collections.Generic;

namespace VehicleServiceAPI.Models
{
    public class Technician
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CenterId { get; set; }
        public string Specialization { get; set; }
        public bool IsDeleted { get; set; }

        public User User { get; set; }
        public ServiceCenter Center { get; set; }
        public ICollection<TechnicianAvailability> Availabilities { get; set; }
        public ICollection<ServiceRequest> ServiceRequests { get; set; }
    }
}
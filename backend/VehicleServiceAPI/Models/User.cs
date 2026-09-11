using System;
using System.Collections.Generic;
namespace VehicleServiceAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public int? CenterId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; }

        public ICollection<Vehicle> Vehicles { get; set; }
        public Technician Technician { get; set; }
        public ICollection<ServiceRequest> ServiceRequests { get; set; }
    }
}
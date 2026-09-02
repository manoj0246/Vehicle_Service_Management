using System.Collections.Generic;

namespace VehicleServiceAPI.Models
{
    public class ServiceCenter
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public bool IsDeleted { get; set; }

        public ICollection<Service> Services { get; set; }
        public ICollection<Technician> Technicians { get; set; }
    }
}
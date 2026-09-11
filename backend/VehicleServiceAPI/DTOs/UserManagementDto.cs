namespace VehicleServiceAPI.DTOs
{
    public class UserManagementDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public int? CenterId { get; set; }
        public string CenterName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class UpdateUserRoleDto
    {
        public string Role { get; set; }
        public int? CenterId { get; set; }
    }
}
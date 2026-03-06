namespace WeeklyPlanner.API.DTOs
{
    public class UserDTO
    {
        public System.Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}

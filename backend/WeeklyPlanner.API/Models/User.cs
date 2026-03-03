namespace WeeklyPlanner.API.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";

        public ICollection<PlanTask> PlanTasks { get; set; } = new List<PlanTask>();
    }
}
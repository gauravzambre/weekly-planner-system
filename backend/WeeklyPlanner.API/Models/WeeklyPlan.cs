namespace WeeklyPlanner.API.Models;

public class WeeklyPlan
{
    public int Id { get; set; }
    public DateTime StartDate { get; set; }
    public bool IsFrozen { get; set; } = false;

    public IList<PlanTask> PlanTasks { get; set; } = new List<PlanTask>();
    public IList<CategoryAllocation> CategoryAllocations { get; set; } = new List<CategoryAllocation>();
}
namespace WeeklyPlanner.API.Models;

public class CategoryAllocation
{
    public int Id { get; set; }
    public int WeeklyPlanId { get; set; }
    public WeeklyPlan? WeeklyPlan { get; set; }

    // needs to match Category.Id (Guid)
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public int Percentage { get; set; }
}
namespace WeeklyPlanner.API.Models;

public class PlanTask
{
    public int Id { get; set; }

    public int WeeklyPlanId { get; set; }
    public WeeklyPlan? WeeklyPlan { get; set; }

    public int BacklogItemId { get; set; }
    public BacklogItem? BacklogItem { get; set; }

    public int TeamMemberId { get; set; }
    public TeamMember? TeamMember { get; set; }

    public int PlannedHours { get; set; }
    public int ActualHours { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }
}
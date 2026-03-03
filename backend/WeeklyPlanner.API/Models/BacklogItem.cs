namespace WeeklyPlanner.API.Models;

public class BacklogItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    // CategoryId should match the type of Category.Id (Guid) to enforce a proper FK
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }  // navigation property
    public int EstimatedHours { get; set; }
}
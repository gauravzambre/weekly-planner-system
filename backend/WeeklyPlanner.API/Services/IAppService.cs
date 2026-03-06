namespace WeeklyPlanner.API.Services;
public interface IAppService
{
    Task SeedAsync();
    Task ResetAsync();
    Task<WeeklyPlanner.API.DTOs.ImportDataDto> ExportAsync();
    Task ImportAsync(WeeklyPlanner.API.DTOs.ImportDataDto data);
}
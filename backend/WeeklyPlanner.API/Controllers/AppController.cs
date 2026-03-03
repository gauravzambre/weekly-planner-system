using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.Services;
using WeeklyPlanner.API.DTOs;
using System.Text;
using System.Text.Json;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/app")]
public class AppController : ControllerBase
{
    private readonly IAppService _appService;

    public AppController(IAppService appService)
    {
        _appService = appService;
    }

    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        await _appService.SeedAsync();
        return Ok("Database seeded successfully.");
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        await _appService.ResetAsync();
        return Ok("Database reset successfully.");
    }

    [HttpPost("export")]
    public async Task<IActionResult> Export()
    {
        var exportData = await _appService.ExportAsync();

        var json = JsonSerializer.Serialize(exportData,
            new JsonSerializerOptions { WriteIndented = true });

        var bytes = Encoding.UTF8.GetBytes(json);

        return File(
            bytes,
            "application/json",
            $"weeklyplantracker-backup-{DateTime.UtcNow:yyyy-MM-dd-HHmmss}.json"
        );
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (!file.FileName.EndsWith(".json"))
            return BadRequest("Invalid file type. Only JSON files are allowed.");

        using var stream = new StreamReader(file.OpenReadStream());
        var json = await stream.ReadToEndAsync();

        var importData = JsonSerializer.Deserialize<ImportDataDto>(json);

        if (importData == null)
            return BadRequest("Invalid file content.");

        await _appService.ImportAsync(importData);

        return Ok("Data imported successfully.");
    }
}
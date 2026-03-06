using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.DTOs;
using Microsoft.EntityFrameworkCore;
namespace WeeklyPlanner.API.Services;
public class AppService : IAppService
{
    private readonly ApplicationDbContext _context;

    public AppService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        await ResetAsync();

        _context.Categories.AddRange(
            new Category { Name = "Client", Description = "Client focused work" },
            new Category { Name = "Tech Debt", Description = "Technical improvements" },
            new Category { Name = "R&D", Description = "Research and development" }
        );

        await _context.SaveChangesAsync();
    }

    public async Task ResetAsync()
    {
        _context.Categories.RemoveRange(_context.Categories);
        _context.Users.RemoveRange(_context.Users);
        _context.TeamMembers.RemoveRange(_context.TeamMembers);
        _context.BacklogItems.RemoveRange(_context.BacklogItems);
        _context.WeeklyPlans.RemoveRange(_context.WeeklyPlans);
        _context.PlanTasks.RemoveRange(_context.PlanTasks);

        await _context.SaveChangesAsync();
    }

    public async Task<ImportDataDto> ExportAsync()
    {
        // use DTOs for export consistency
        return new ImportDataDto
        {
            Categories = await _context.Categories.Select(c => new DTOs.CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                CreatedAt = c.CreatedAt
            }).ToListAsync(),
            Users = await _context.Users.Select(u => new DTOs.UserDTO
            {
                Id = u.Id,
                Name = u.Name,
                Role = u.Role
            }).ToListAsync(),
            TeamMembers = await _context.TeamMembers.Select(m => new DTOs.TeamMemberDto
            {
                Id = m.Id,
                Name = m.Name,
                Role = m.Role
            }).ToListAsync(),
            Backlog = await _context.BacklogItems.Select(b => new DTOs.BacklogItemDto
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                CategoryId = b.CategoryId,
                EstimatedHours = b.EstimatedHours
            }).ToListAsync(),
            WeeklyPlans = await _context.WeeklyPlans.Select(p => new DTOs.WeeklyPlanDto
            {
                Id = p.Id,
                StartDate = p.StartDate,
                IsFrozen = p.IsFrozen
            }).ToListAsync(),
            PlanTasks = await _context.PlanTasks.Select(t => new DTOs.PlanTaskDto
            {
                Id = t.Id,
                WeeklyPlanId = t.WeeklyPlanId,
                BacklogItemId = t.BacklogItemId,
                TeamMemberId = t.TeamMemberId,
                PlannedHours = t.PlannedHours,
                ActualHours = t.ActualHours,
                UserId = t.UserId
            }).ToListAsync(),
            CategoryAllocations = await _context.CategoryAllocations.Select(a => new DTOs.CategoryAllocationDto
            {
                Id = a.Id,
                WeeklyPlanId = a.WeeklyPlanId,
                CategoryId = a.CategoryId,
                Percentage = a.Percentage
            }).ToListAsync()
        };
    }

    public async Task ImportAsync(ImportDataDto data)
    {
        // clear existing data and import in correct order
        await ResetAsync();

        if (data.Categories?.Any() == true)
            _context.Categories.AddRange(data.Categories.Select(c => new Category
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                CreatedAt = c.CreatedAt
            }));

        if (data.Users?.Any() == true)
            _context.Users.AddRange(data.Users.Select(u => new User
            {
                Id = u.Id,
                Name = u.Name,
                Role = u.Role
            }));

        if (data.TeamMembers?.Any() == true)
            _context.TeamMembers.AddRange(data.TeamMembers.Select(m => new TeamMember
            {
                Id = m.Id,
                Name = m.Name,
                Role = m.Role
            }));

        if (data.Backlog?.Any() == true)
            _context.BacklogItems.AddRange(data.Backlog.Select(b => new BacklogItem
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                CategoryId = b.CategoryId,
                EstimatedHours = b.EstimatedHours
            }));

        if (data.WeeklyPlans?.Any() == true)
            _context.WeeklyPlans.AddRange(data.WeeklyPlans.Select(p => new WeeklyPlan
            {
                Id = p.Id,
                StartDate = p.StartDate,
                IsFrozen = p.IsFrozen
            }));

        if (data.PlanTasks?.Any() == true)
            _context.PlanTasks.AddRange(data.PlanTasks.Select(t => new PlanTask
            {
                Id = t.Id,
                WeeklyPlanId = t.WeeklyPlanId,
                BacklogItemId = t.BacklogItemId,
                TeamMemberId = t.TeamMemberId,
                PlannedHours = t.PlannedHours,
                ActualHours = t.ActualHours,
                UserId = t.UserId
            }));

        if (data.CategoryAllocations?.Any() == true)
            _context.CategoryAllocations.AddRange(data.CategoryAllocations.Select(a => new CategoryAllocation
            {
                Id = a.Id,
                WeeklyPlanId = a.WeeklyPlanId,
                CategoryId = a.CategoryId,
                Percentage = a.Percentage
            }));

        await _context.SaveChangesAsync();
    }
}
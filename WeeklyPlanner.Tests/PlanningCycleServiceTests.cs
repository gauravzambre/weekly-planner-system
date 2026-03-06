using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Enums;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.Services;
using Xunit;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace WeeklyPlanner.Tests;

public class PlanningCycleServiceTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task ValidatePlanForFreeze_WithFullyAllocatedMembers_ReturnsValid()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var logger = new TestLogger<PlanningCycleService>();
        var service = new PlanningCycleService(context, logger);

        var category = new Category { Id = Guid.NewGuid(), Name = "Client Focused", Description = "Test" };
        var teamMember = new TeamMember { Id = 1, Name = "John Doe", Role = "LEAD" };
        var backlogItem = new BacklogItem { Id = 1, Title = "Test Item", CategoryId = category.Id, EstimatedHours = 30m, Status = BacklogItemStatus.Available };
        var plan = new WeeklyPlan 
        { 
            Id = 1, 
            StartDate = DateTime.Now.AddDays(-1),
            EndDate = DateTime.Now.AddDays(5),
            Status = PlanningCycleStatus.Planning,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var categoryAllocation = new CategoryAllocation
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            WeeklyPlan = plan,
            CategoryId = category.Id,
            Category = category,
            Percentage = 100,
            AllocatedHours = 30m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var planTask = new PlanTask
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            BacklogItemId = backlogItem.Id,
            TeamMemberId = teamMember.Id,
            PlannedHours = 30m,
            ActualHours = 0m,
            Status = CommitmentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);
        context.TeamMembers.Add(teamMember);
        context.BacklogItems.Add(backlogItem);
        context.WeeklyPlans.Add(plan);
        context.CategoryAllocations.Add(categoryAllocation);
        context.PlanTasks.Add(planTask);
        await context.SaveChangesAsync();

        // Act
        var validation = await service.ValidatePlanForFreezeAsync(plan.Id);

        // Assert
        Assert.True(validation.IsValid);
        Assert.Empty(validation.Errors);
        Assert.All(validation.MemberValidations, m => Assert.True(m.IsFullyAllocated));
        Assert.All(validation.CategoryValidations, c => Assert.True(c.IsBalanced));
    }

    [Fact]
    public async Task ValidatePlanForFreeze_WithUnderallocatedMember_ReturnsInvalid()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var logger = new TestLogger<PlanningCycleService>();
        var service = new PlanningCycleService(context, logger);

        var category = new Category { Id = Guid.NewGuid(), Name = "Client Focused", Description = "Test" };
        var teamMember = new TeamMember { Id = 1, Name = "John Doe", Role = "LEAD" };
        var backlogItem = new BacklogItem { Id = 1, Title = "Test Item", CategoryId = category.Id, EstimatedHours = 20m, Status = BacklogItemStatus.Available };
        var plan = new WeeklyPlan 
        { 
            Id = 1, 
            StartDate = DateTime.Now.AddDays(-1),
            EndDate = DateTime.Now.AddDays(5),
            Status = PlanningCycleStatus.Planning,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var categoryAllocation = new CategoryAllocation
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            WeeklyPlan = plan,
            CategoryId = category.Id,
            Category = category,
            Percentage = 100,
            AllocatedHours = 30m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var planTask = new PlanTask
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            BacklogItemId = backlogItem.Id,
            TeamMemberId = teamMember.Id,
            PlannedHours = 20m, // Only 20 hours, needs 30
            ActualHours = 0m,
            Status = CommitmentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);
        context.TeamMembers.Add(teamMember);
        context.BacklogItems.Add(backlogItem);
        context.WeeklyPlans.Add(plan);
        context.CategoryAllocations.Add(categoryAllocation);
        context.PlanTasks.Add(planTask);
        await context.SaveChangesAsync();

        // Act
        var validation = await service.ValidatePlanForFreezeAsync(plan.Id);

        // Assert
        Assert.False(validation.IsValid);
        Assert.NotEmpty(validation.Errors);
        Assert.Contains("John Doe has 20h planned but is allocated 30h (10h remaining)", validation.Errors);
    }

    [Fact]
    public async Task ValidatePlanForFreeze_WithCategoryImbalance_ReturnsInvalid()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var logger = new TestLogger<PlanningCycleService>();
        var service = new PlanningCycleService(context, logger);

        var category1 = new Category { Id = Guid.NewGuid(), Name = "Client Focused", Description = "Test" };
        var category2 = new Category { Id = Guid.NewGuid(), Name = "Tech Debt", Description = "Test" };
        var teamMember = new TeamMember { Id = 1, Name = "John Doe", Role = "LEAD" };
        var backlogItem = new BacklogItem { Id = 1, Title = "Test Item", CategoryId = category1.Id, EstimatedHours = 30m, Status = BacklogItemStatus.Available };
        var plan = new WeeklyPlan 
        { 
            Id = 1, 
            StartDate = DateTime.Now.AddDays(-1),
            EndDate = DateTime.Now.AddDays(5),
            Status = PlanningCycleStatus.Planning,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        // 50/50 split but all hours go to category 1
        var allocation1 = new CategoryAllocation
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            WeeklyPlan = plan,
            CategoryId = category1.Id,
            Category = category1,
            Percentage = 50,
            AllocatedHours = 15m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var allocation2 = new CategoryAllocation
        {
            Id = 2,
            WeeklyPlanId = plan.Id,
            WeeklyPlan = plan,
            CategoryId = category2.Id,
            Category = category2,
            Percentage = 50,
            AllocatedHours = 15m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var planTask = new PlanTask
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            BacklogItemId = backlogItem.Id,
            TeamMemberId = teamMember.Id,
            PlannedHours = 30m, // All 30 hours to category 1
            ActualHours = 0m,
            Status = CommitmentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category1);
        context.Categories.Add(category2);
        context.TeamMembers.Add(teamMember);
        context.BacklogItems.Add(backlogItem);
        context.WeeklyPlans.Add(plan);
        context.CategoryAllocations.Add(allocation1);
        context.CategoryAllocations.Add(allocation2);
        context.PlanTasks.Add(planTask);
        await context.SaveChangesAsync();

        // Act
        var validation = await service.ValidatePlanForFreezeAsync(plan.Id);

        // Assert
        Assert.False(validation.IsValid);
        Assert.NotEmpty(validation.Errors);
        Assert.Equal(2, validation.CategoryValidations.Count(c => !c.IsBalanced));
    }

    [Fact]
    public async Task FreezePlan_WithValidPlan_UpdatesStatusAndCommitmentStatus()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var logger = new TestLogger<PlanningCycleService>();
        var service = new PlanningCycleService(context, logger);

        var category = new Category { Id = Guid.NewGuid(), Name = "Client Focused", Description = "Test" };
        var teamMember = new TeamMember { Id = 1, Name = "John Doe", Role = "LEAD" };
        var backlogItem = new BacklogItem { Id = 1, Title = "Test Item", CategoryId = category.Id, EstimatedHours = 30m, Status = BacklogItemStatus.Available };
        var plan = new WeeklyPlan 
        { 
            Id = 1, 
            StartDate = DateTime.Now.AddDays(-1),
            EndDate = DateTime.Now.AddDays(5),
            Status = PlanningCycleStatus.Planning,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var categoryAllocation = new CategoryAllocation
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            WeeklyPlan = plan,
            CategoryId = category.Id,
            Category = category,
            Percentage = 100,
            AllocatedHours = 30m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var planTask = new PlanTask
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            BacklogItemId = backlogItem.Id,
            TeamMemberId = teamMember.Id,
            PlannedHours = 30m,
            ActualHours = 0m,
            Status = CommitmentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);
        context.TeamMembers.Add(teamMember);
        context.BacklogItems.Add(backlogItem);
        context.WeeklyPlans.Add(plan);
        context.CategoryAllocations.Add(categoryAllocation);
        context.PlanTasks.Add(planTask);
        await context.SaveChangesAsync();

        // Act
        var success = await service.FreezePlanAsync(plan.Id);

        // Assert
        Assert.True(success);
        var updatedPlan = context.WeeklyPlans.Find(plan.Id);
        Assert.NotNull(updatedPlan);
        Assert.Equal(PlanningCycleStatus.Frozen, updatedPlan.Status);
        Assert.NotNull(updatedPlan.FrozenAt);

        var updatedTask = context.PlanTasks.Find(planTask.Id);
        Assert.NotNull(updatedTask);
        Assert.Equal(CommitmentStatus.Approved, updatedTask.Status);
    }

    [Fact]
    public async Task FreezePlan_WithInvalidPlan_ReturnsFalse()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var logger = new TestLogger<PlanningCycleService>();
        var service = new PlanningCycleService(context, logger);

        var category = new Category { Id = Guid.NewGuid(), Name = "Client Focused", Description = "Test" };
        var teamMember = new TeamMember { Id = 1, Name = "John Doe", Role = "LEAD" };
        var backlogItem = new BacklogItem { Id = 1, Title = "Test Item", CategoryId = category.Id, EstimatedHours = 20m, Status = BacklogItemStatus.Available };
        var plan = new WeeklyPlan 
        { 
            Id = 1, 
            StartDate = DateTime.Now.AddDays(-1),
            EndDate = DateTime.Now.AddDays(5),
            Status = PlanningCycleStatus.Planning,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var categoryAllocation = new CategoryAllocation
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            WeeklyPlan = plan,
            CategoryId = category.Id,
            Category = category,
            Percentage = 100,
            AllocatedHours = 30m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var planTask = new PlanTask
        {
            Id = 1,
            WeeklyPlanId = plan.Id,
            BacklogItemId = backlogItem.Id,
            TeamMemberId = teamMember.Id,
            PlannedHours = 20m, // Under-allocated
            ActualHours = 0m,
            Status = CommitmentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);
        context.TeamMembers.Add(teamMember);
        context.BacklogItems.Add(backlogItem);
        context.WeeklyPlans.Add(plan);
        context.CategoryAllocations.Add(categoryAllocation);
        context.PlanTasks.Add(planTask);
        await context.SaveChangesAsync();

        // Act
        var success = await service.FreezePlanAsync(plan.Id);

        // Assert
        Assert.False(success);
        var unchangedPlan = context.WeeklyPlans.Find(plan.Id);
        Assert.Equal(PlanningCycleStatus.Planning, unchangedPlan!.Status);
    }
}

/// <summary>
/// Simple test logger implementation
/// </summary>
public class TestLogger<T> : ILogger<T>
{
    public IDisposable BeginScope<TState>(TState state) => null!;
    public bool IsEnabled(LogLevel logLevel) => true;
    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        Console.WriteLine($"[{logLevel}] {formatter(state, exception)}");
    }
}
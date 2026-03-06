using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<BacklogItem> BacklogItems => Set<BacklogItem>();
        public DbSet<WeeklyPlan> WeeklyPlans => Set<WeeklyPlan>();
        public DbSet<PlanTask> PlanTasks => Set<PlanTask>();
        public DbSet<CategoryAllocation> CategoryAllocations => Set<CategoryAllocation>();
        public DbSet<TeamMember> TeamMembers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Only GUID PKs should use NEWID() default values. int keys use identity by default.
            modelBuilder.Entity<User>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<Category>().Property(x => x.Id).HasDefaultValueSql("NEWID()");

            // Relationships and foreign keys
            modelBuilder.Entity<BacklogItem>()
                .HasOne(b => b.Category)
                .WithMany()
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CategoryAllocation>()
                .HasOne(a => a.Category)
                .WithMany()
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CategoryAllocation>()
                .HasOne(a => a.WeeklyPlan)
                .WithMany(p => p.CategoryAllocations)
                .HasForeignKey(a => a.WeeklyPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlanTask>()
                .HasOne(t => t.WeeklyPlan)
                .WithMany(p => p.PlanTasks)
                .HasForeignKey(t => t.WeeklyPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlanTask>()
                .HasOne(t => t.BacklogItem)
                .WithMany()
                .HasForeignKey(t => t.BacklogItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PlanTask>()
                .HasOne(t => t.TeamMember)
                .WithMany()
                .HasForeignKey(t => t.TeamMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PlanTask>()
                .HasOne(t => t.User)
                .WithMany(u => u.PlanTasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            base.OnModelCreating(modelBuilder);
        }
    }
}
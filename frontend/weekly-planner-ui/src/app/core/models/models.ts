export interface TeamMember { id: number; name: string; role: string; }
export interface BacklogItem { id: number; title: string; description: string; categoryId: number; categoryName: string; estimatedHours: number; status: string; }
export interface Category { id: number; name: string; description: string; }
export interface WeeklyPlan { id: number; startDate: string; isFrozen: boolean; planTasks: PlanTask[]; categoryAllocations: CategoryAllocation[]; }
export interface PlanTask { id: number; weeklyPlanId: number; backlogItemId: number; backlogItemTitle: string; teamMemberId: number; teamMemberName: string; plannedHours: number; completedHours: number; status: string; categoryId: number; categoryName: string; userId: string; }
export interface CategoryAllocation { id: number; weeklyPlanId: number; categoryId: number; categoryName: string; percentage: number; }
export interface AppUser { id: string; name: string; role: string; teamMemberId: number; }

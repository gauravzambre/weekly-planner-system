import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private b = environment.apiBaseUrl;
  private h = new HttpHeaders({ 'Content-Type': 'application/json' });

  seed(): Observable<any> { return this.http.post(`${this.b}/api/app/seed`, {}, { headers: this.h, responseType: 'text' as 'json' }); }
  reset(): Observable<any> { return this.http.post(`${this.b}/api/app/reset`, {}, { headers: this.h, responseType: 'text' as 'json' }); }
  exportData(): Observable<any> { return this.http.post(`${this.b}/api/app/export`, {}, { headers: this.h }); }
  importData(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.b}/api/app/import`, formData);
  }

  login(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/auth/login`, d, { headers: this.h }); }
  refresh(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/auth/refresh`, d, { headers: this.h }); }
  logout(): Observable<any> { return this.http.post<any>(`${this.b}/api/auth/logout`, {}, { headers: this.h }); }

  getBacklog(): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/backlog`).pipe(catchError(() => of([]))); }
  createBacklogItem(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/backlog`, d, { headers: this.h }); }
  updateBacklogItem(id: number, d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/backlog/${id}`, d, { headers: this.h }); }
  deleteBacklogItem(id: number): Observable<any> { return this.http.delete(`${this.b}/api/backlog/${id}`); }

  getCategories(): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/categories`).pipe(catchError(() => of([]))); }
  createCategory(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/categories`, d, { headers: this.h }); }
  updateCategory(id: number, d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/categories/${id}`, d, { headers: this.h }); }
  deleteCategory(id: number): Observable<any> { return this.http.delete(`${this.b}/api/categories/${id}`); }

  getCategoryAllocation(planId: number): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/categoryallocation/plan/${planId}`).pipe(catchError(() => of([]))); }
  createCategoryAllocation(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/categoryallocation`, d, { headers: this.h }); }
  deleteCategoryAllocation(id: number): Observable<any> { return this.http.delete(`${this.b}/api/categoryallocation/${id}`); }

  getTeamMembers(): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/team-members`).pipe(catchError(() => of([]))); }
  getTeamMember(id: number): Observable<any> { return this.http.get<any>(`${this.b}/api/team-members/${id}`); }
  createTeamMember(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/team-members`, d, { headers: this.h }); }
  updateTeamMember(id: number, d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/team-members/${id}`, d, { headers: this.h }); }
  deleteTeamMember(id: number): Observable<any> { return this.http.delete(`${this.b}/api/team-members/${id}`); }
  getTeamMemberByUser(userId: string): Observable<any> { return this.http.get<any>(`${this.b}/api/team-members/user/${userId}`); }

  getUsers(): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/users`).pipe(catchError(() => of([]))); }
  getUser(id: number): Observable<any> { return this.http.get<any>(`${this.b}/api/users/${id}`); }
  createUser(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/users`, d, { headers: this.h }); }
  updateUser(d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/users`, d, { headers: this.h }); }
  deleteUser(id: number): Observable<any> { return this.http.delete(`${this.b}/api/users/${id}`); }

  getWeeklyPlans(): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/weeklyplan`).pipe(catchError(() => of([]))); }
  getWeeklyPlan(id: number): Observable<any> { return this.http.get<any>(`${this.b}/api/weeklyplan/${id}`); }
  createWeeklyPlan(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/weeklyplan`, d, { headers: this.h }); }
  updateWeeklyPlan(id: number, d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/weeklyplan/${id}`, d, { headers: this.h }); }
  deleteWeeklyPlan(id: number): Observable<any> { return this.http.delete(`${this.b}/api/weeklyplan/${id}`); }
  finalizeWeeklyPlan(id: number): Observable<any> { return this.http.post<any>(`${this.b}/api/weeklyplan/${id}/finalize`, {}, { headers: this.h }); }

  getPlanTasks(): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/plantasks`).pipe(catchError(() => of([]))); }
  getPlanTasksByPlan(planId: number): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/plantasks/plan/${planId}`).pipe(catchError(() => of([]))); }
  getPlanTasksByMember(memberId: number): Observable<any[]> { return this.http.get<any[]>(`${this.b}/api/plantasks/member/${memberId}`).pipe(catchError(() => of([]))); }
  createPlanTask(d: any): Observable<any> { return this.http.post<any>(`${this.b}/api/plantasks`, d, { headers: this.h }); }
  updatePlanTask(id: number, d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/plantasks/${id}`, d, { headers: this.h }); }
  updatePlanTaskProgress(id: number, d: any): Observable<any> { return this.http.put<any>(`${this.b}/api/plantasks/${id}/progress`, d, { headers: this.h }); }
  deletePlanTask(id: number): Observable<any> { return this.http.delete(`${this.b}/api/plantasks/${id}`); }

  getTeamProgress(): Observable<any> { return this.http.get<any>(`${this.b}/api/dashboard/team-progress`).pipe(catchError(() => of(null))); }
  getMemberProgress(id: number): Observable<any> { return this.http.get<any>(`${this.b}/api/dashboard/member-progress/${id}`).pipe(catchError(() => of(null))); }
}

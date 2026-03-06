import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AppStateService } from '../../../core/services/app-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({ selector: 'app-backlog-item-form', standalone: true, imports: [CommonModule, FormsModule, HeaderComponent], templateUrl: './backlog-item-form.component.html' })
export class BacklogItemFormComponent implements OnInit {
  router = inject(Router); private route = inject(ActivatedRoute);
  private api = inject(ApiService); private state = inject(AppStateService); private toast = inject(ToastService);
  isEdit = signal(false); saving = signal(false); submitted = false;
  cats = signal<any[]>([]); editId = 0;
  title = ''; desc = ''; catId = 0; hours = 0;

  ngOnInit() {
    this.api.getCategories().subscribe((c: any[]) => this.cats.set(c));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true); this.editId = +id;
      const item = this.state.backlog().find((b: any) => b.id === this.editId);
      if (item) { this.title = item.title; this.desc = item.description; this.catId = item.categoryId; this.hours = item.estimatedHours; }
    }
  }

  save() {
    this.submitted = true;
    if (!this.title || !this.catId) return;
    this.saving.set(true);
    const dto = { title: this.title, description: this.desc, categoryId: +this.catId, estimatedHours: +this.hours || 0 };
    const call = this.isEdit() ? this.api.updateBacklogItem(this.editId, dto) : this.api.createBacklogItem(dto);
    call.subscribe({
      next: (item: any) => {
        if (this.isEdit()) this.state.backlog.update((a: any[]) => a.map((b: any) => b.id===item.id ? item : b));
        else this.state.backlog.update((a: any[]) => [...a, item]);
        this.toast.success(this.isEdit() ? 'Item updated!' : 'Item added!');
        this.router.navigate(['/backlog']);
      },
      error: () => this.saving.set(false)
    });
  }
}

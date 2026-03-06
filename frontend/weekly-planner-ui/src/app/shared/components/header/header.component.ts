import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';
@Component({ selector: 'app-header', standalone: true, imports: [CommonModule], templateUrl: './header.component.html' })
export class HeaderComponent {
  @Input() showSwitch = false;
  @Input() showHome = true;
  @Input() backLabel = '';
  @Input() backRoute = '';
  state = inject(AppStateService);
  router = inject(Router);
  goHome() { this.state.currentUser() ? this.router.navigate(['/dashboard']) : this.router.navigate(['/home']); }
  goBack() { this.backRoute ? this.router.navigate([this.backRoute]) : history.back(); }
  switchUser() { this.state.clearCurrentUser(); this.router.navigate(['/home']); }
}

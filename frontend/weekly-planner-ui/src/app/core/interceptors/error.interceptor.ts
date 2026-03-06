import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const t = inject(ToastService);
  return next(req).pipe(catchError(err => { t.error(err?.error?.message || err?.error?.title || 'Request failed'); return throwError(() => err); }));
};

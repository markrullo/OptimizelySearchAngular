import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingIndicatorService } from '../services/data/loading-indicator.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {

	constructor(private loading: LoadingIndicatorService) { }

	// intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
	// 	return next.handle(request);
	// }

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		this.loading.show();

		return next.handle(request).pipe(
			finalize(() => {
				this.loading.hide();
			})
		);
	}
}

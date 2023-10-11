import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class LoadingIndicatorService {
	private _loading = new BehaviorSubject<boolean>(false);
	public readonly loading$ = this._loading.asObservable().pipe(		
		shareReplay(1) 
	);
	
	private _activeConnections = 0;

	constructor() { }

	show() {
		this._activeConnections++;
		//console.log("LoadingIndicatorService True", this._activeConnections);

		this._loading.next(true);
	}

	hide() {
		this._activeConnections--;
		//console.log("LoadingIndicatorService False", this._activeConnections);
		if(this._activeConnections === 0){
			this._loading.next(false);
		}		
	}
}

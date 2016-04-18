import {
	APP_INITIALIZER,
	ApplicationRef,
	Injectable,
	Inject,
	OpaqueToken,
	Provider,
	Type
} from 'angular2/core';

import {isType} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {makeDecorator} from 'angular2/src/core/util/decorators';

import {
	Http,
	RequestOptions,
	RequestMethod,
	Request,
	Response
} from 'angular2/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import {MemCache} from './utils';
import {
	PotionRequestOptions,
	PotionOptions,
	PotionBase
} from './base';


export {
	Item,
	Route
} from './base';


export let POTION_CONFIG = new OpaqueToken('PotionConfig');
export interface PotionConfig extends PotionOptions {}


class PotionResourcesAnnotation {
	resources: Resource[];
	constructor(resources: Resource[]) {
		this.resources = resources;
	}
}

/* tslint:disable: variable-name */
export let PotionResources: (resources: Resource[]) => ClassDecorator  = makeDecorator(PotionResourcesAnnotation);
/* tslint:enable: variable-name */

export class Resource {
	path: string;
	type: Type;
	constructor({path, type}: {path: string, type: Type}) {
		this.path = path;
		this.type = type;
	}
}


@Injectable()
export class Potion extends PotionBase {
	_http: Http;

	constructor(http: Http, @Inject(POTION_CONFIG) config: PotionConfig) {
		super(config);
		// Use Angular 2 Http for requests
		this._http = http;
	}

	registerFromComponent(component: any) {
		if (!isType(component)) {
			return;
		}

		if (component) {
			let annotations = reflector.annotations(component);
			for (let annotation of annotations) {
				if (annotation instanceof PotionResourcesAnnotation) {
					for (let resource of annotation.resources) {
						let {path, type} = resource;
						if (this.resources[path] === undefined) {
							this.register(path, type);
						} else {
							throw new TypeError(`Cannot register ${type.name} for "${path}". A resource has already been registered on "${path}"`);
						}
					}
				}
			}
		}
	}

	request(uri, {method = 'GET', data = null}: PotionRequestOptions = {}): Promise<any> {
		// Angular Http Request accepts a RequestMethod type for a method,
		// but the value for that is an integer.
		// Therefore we need to match the string literals like 'GET' to the enum values for RequestMethod.
		let request = new RequestOptions({
			method: parseInt((<any>Object).entries(RequestMethod).find((entry) => entry[1].toLowerCase() === (<string>method).toLowerCase())[0], 10),
			url: uri
		});

		if (data) {
			request = request.merge({
				body: JSON.stringify(data)
			});
		}

		/* tslint:disable: align */
		let obs = new Observable((observer) => {
			let subscriber = this._http.request(new Request(request)).subscribe((response: Response) => {
				// TODO: handle errors
				observer.next({
					headers: response.headers ? JSON.parse(<any>response.headers.toJSON()) : {},
					data: response.json()
				});
				observer.complete();
			}, (error) => observer.error(error));

			return () => {
				subscriber.unsubscribe();
			};
		});
		/* tslint:enable: align */

		return obs.toPromise();
	}
}


export const POTION_PROVIDERS = [
	new Provider(APP_INITIALIZER, {
		useFactory: (appRef: ApplicationRef, potion: Potion) => {
			// Do not remove this,
			// having it run on app init,
			// will ensure that whatever resources were added via `@PotionResources` decorator,
			// will be registered with Potion.
			return () => {
				appRef.registerBootstrapListener(() => {
					// Register resources added via `@PotionResources` decorator
					for (let component of appRef.componentTypes) {
						potion.registerFromComponent(component);
					}
				});
			};
		},
		multi: true,
		deps: [
			ApplicationRef,
			Potion
		]
	}),
	new Provider(POTION_CONFIG, {
		useValue: {
			prefix: '/api',
			cache: new MemCache()
		}
	}),
	new Provider(Potion, {
		useClass: Potion,
		deps: [
			Http,
			POTION_CONFIG
		]
	})
];

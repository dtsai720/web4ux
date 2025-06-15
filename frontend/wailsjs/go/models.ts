export namespace models {

	export class Project {
	    id?: string;
	    name?: string;
	    creator?: string;
	    // Go type: time
	    updatedAt: any;

	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.creator = source["creator"];
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }

		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProjectDetail {
	    projectName?: string;
	    projectCreator?: string;
	    projectUpdatedAt?: string;
	    deviceName?: string;
	    participantName?: string;
	    participantSerial?: string;
	    informationId?: string;
	    deleted: boolean;
	    errorTimes: number;
	    isFailed: boolean;
	    trailNumber: number;
	    mark?: string;
	    timestamp: number;

	    static createFrom(source: any = {}) {
	        return new ProjectDetail(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectName = source["projectName"];
	        this.projectCreator = source["projectCreator"];
	        this.projectUpdatedAt = source["projectUpdatedAt"];
	        this.deviceName = source["deviceName"];
	        this.participantName = source["participantName"];
	        this.participantSerial = source["participantSerial"];
	        this.informationId = source["informationId"];
	        this.deleted = source["deleted"];
	        this.errorTimes = source["errorTimes"];
	        this.isFailed = source["isFailed"];
	        this.trailNumber = source["trailNumber"];
	        this.mark = source["mark"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class ProjectSummaries {
	    total?: number;
	    data?: Project[];

	    static createFrom(source: any = {}) {
	        return new ProjectSummaries(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total = source["total"];
	        this.data = this.convertValues(source["data"], Project);
	    }

		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace pkg {

	export class LoginResponse {
	    success: boolean;
	    message: string;

	    static createFrom(source: any = {}) {
	        return new LoginResponse(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class Request {
	    Device: string;
	    Participant: string;
	    Trail: number;

	    static createFrom(source: any = {}) {
	        return new Request(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Device = source["Device"];
	        this.Participant = source["Participant"];
	        this.Trail = source["Trail"];
	    }
	}

}

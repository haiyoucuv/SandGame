const {ccclass, property} = cc._decorator;

@ccclass
export default class EventMgr extends cc.Component {
	public static ins: EventMgr = null;

	private events_map = {};

	onLoad() {
		if (EventMgr.ins === null) {
			EventMgr.ins = this;
		} else {
			this.destroy();
			return;
		}
	}

	// func(event_name: string, udata: any)
	public on(name: string, func: Function, caller?: any) {
		if (!this.events_map[name]) {
			this.events_map[name] = [];
		}

		const event_queue = this.events_map[name];
		event_queue.push({
			caller: caller,
			func: func
		});
	}

	public off(name: string, func: Function, caller?: any) {
		if (!this.events_map[name]) {
			return;
		}

		const event_queue = this.events_map[name];
		for (let i = 0; i < event_queue.length; i++) {
			const obj = event_queue[i];
			if (obj.caller == caller && obj.func == func) {
				event_queue.splice(i, 1);
				break;
			}
		}

		if (event_queue.length <= 0) {
			this.events_map[name] = null;
		}
	}

	public dispatch(name, data?) {
		if (!this.events_map[name]) {
			return;
		}

		const event_queue = this.events_map[name];
		for (let i = 0; i < event_queue.length; i++) {
			const obj = event_queue[i];
			obj.func.call(obj.caller, name, data);
		}
	}
}

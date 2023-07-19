import EventMgr from "../EventMgr";

const {ccclass, property} = cc._decorator;

var State = {
	Disconnected: 0, // 断开连接
	Connecting: 1, // 正在连接
	Connected: 2, // 已经连接;
};

@ccclass
export default class NetMgr extends cc.Component {
	public static Instance: NetMgr = null;

	private url: string = "ws://127.0.0.1:6081/ws";
	private state: number = State.Disconnected;
	private sock: WebSocket = null;

	onLoad() {
		if (NetMgr.Instance === null) {
			NetMgr.Instance = this;
		} else {
			this.destroy();
			return;
		}

		this.state = State.Disconnected;
	}

	_on_opened(event) {
		this.state = State.Connected;
		cc.log("connect to server: " + this.url + " sucess!");
		EventMgr.ins.dispatch("net_connect", null);
	}

	_on_recv_data(event) {
		EventMgr.ins.dispatch("net_message", event.data);
	}

	close_socket() {
		if (this.state === State.Connected) {
			if (this.sock !== null) {
				this.sock.close();
				this.sock = null;
			}
		}
		EventMgr.ins.dispatch("net_disconnect", null);
		this.state = State.Disconnected;
	}

	_on_socket_close(event) {
		this.close_socket();
	}

	_on_socket_err(event) {
		this.close_socket();
	}

	// 发起连接;
	connect_to_server() {
		if (this.state !== State.Disconnected) {
			return;
		}

		EventMgr.ins.dispatch("net_connecting", null);

		this.state = State.Connecting;
		this.sock = new WebSocket(this.url); // H5标准，底层做好了;
		this.sock.binaryType = "arraybuffer";

		this.sock.onopen = this._on_opened.bind(this);
		this.sock.onmessage = this._on_recv_data.bind(this);
		this.sock.onclose = this._on_socket_close.bind(this);
		this.sock.onerror = this._on_socket_err.bind(this);
	}

	send_data(data_arraybuf) {
		if (this.state === State.Connected && this.sock) {
			this.sock.send(data_arraybuf);
		}
	}

	update(dt: number) {
		if (this.state !== State.Disconnected) {
			return;
		}

		this.connect_to_server();
	}
}

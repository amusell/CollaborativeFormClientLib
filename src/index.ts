import { Socket, io } from "socket.io-client";
import { IUserModel } from "./models/user.interface";
import { CollaborativeAbstractPlugin } from "./models/collaborative-plugin.class";
import { CollaborativeFields } from "./plugins/collaborative-fields";
import { CollaborativePointer } from "./plugins/collaborative-pointer";

export class CollaborativeForm {
	private socket: Socket;
	private userData: IUserModel | undefined;
	private roomId: string | undefined;
	private plugins: CollaborativeAbstractPlugin<any>[] = [];
	private readonly EVENT = {
		READY: "collaborative-form-ready",
	};

	constructor(
		host: string,
		options: { plugins: { fields: boolean; pointer: boolean } } = {
			plugins: { fields: true, pointer: true },
		}
	) {
		this.socket = io(host);
	}

	public setUser(userData: IUserModel) {
		this.userData = userData;
		if (!userData?.userId) {
			this.destroy();
		} else {
			this.init();
		}
	}

	private destroy() {
		this.plugins.forEach((plugin) => {
			plugin.destroy();
		});
	}

	public join(roomId: string) {
		this.roomId = roomId;
		this.init();
	}

	private init() {
		if (!this.roomId || !this.userData?.userId) {
			return;
		}
		[CollaborativeFields, CollaborativePointer].forEach((plugin) => {
			this.plugins.push(
				new plugin(this.socket, () => ({
					...(this.userData || { userName: "", userId: "" }),
					roomId: this.roomId,
					path: window.location.pathname,
				}))
			);
		});
	}
}

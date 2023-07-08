import { Socket } from "socket.io-client";
import { IDriveData } from "./drive-data.interface";

export abstract class CollaborativeAbstractPlugin<D> {
	public abstract readonly EVENT_NAME: string;
	protected observer: MutationObserver | undefined;
	protected readonly userMessageMap: { [userId: string]: D & IDriveData } = {};

	constructor(
		protected readonly socket: Socket,
		protected readonly mainDataRetriever: () => IDriveData
	) {
		this.registerPlugin();
	}

	protected registerPlugin() {
		this.observer = new MutationObserver(() => {
			Object.values(this.userMessageMap).forEach((data) => {
				this.onMessage(data);
			});
		});
		this.observer.observe(document.getElementsByTagName("body")[0], {
			attributes: false,
			childList: true,
			subtree: true,
		});

		this.socket.onAny((name, data) => {
			if (name === this.EVENT_NAME) {
				this.userMessageMap[data?.userId] = data;
				this.onMessage(data);
			}
		});
	}

	protected sendMessage(data?: D) {
		const socketMessage = {
			...this.mainDataRetriever(),
			...(data || {}),
		};
		if (socketMessage.userId && socketMessage.roomId && socketMessage.path) {
			this.socket.emit(this.EVENT_NAME, socketMessage);
		}
	}

	protected abstract onMessage(message: D & IDriveData): void;

	public destroy(): void {
		if (this.observer) {
			this.observer.disconnect();
			Object.keys(this.userMessageMap).forEach((key) => {
				delete this.userMessageMap[key];
			});
		}
		this.socket.off(this.EVENT_NAME);
	}
}

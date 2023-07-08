import { CollaborativeAbstractPlugin } from "../models/collaborative-plugin.class";
import { IDriveData } from "../models/drive-data.interface";

interface ICollaborativePointerEvent {
	x: number;
	y: number;
}

export class CollaborativePointer extends CollaborativeAbstractPlugin<ICollaborativePointerEvent> {
	public readonly EVENT_NAME = "collaborative-pointer";

	protected override registerPlugin() {
		super.registerPlugin();
		document.addEventListener("mousemove", (event) => this.eventHandler(event));
	}

	private eventHandler(event?: MouseEvent) {
		this.sendMessage(
			event
				? {
						x: event.clientX / window.innerWidth,
						y: event.clientY / window.innerHeight,
				  }
				: undefined
		);
	}

	private readonly CLASS_NAME = "collaborative-pointer";
	private readonly ATTR_NAME = "collaborative-pointer";

	protected onMessage(message: ICollaborativePointerEvent & IDriveData): void {
		const currentData = this.mainDataRetriever();
		let pointerElement: HTMLElement | undefined = Array.from(
			document.getElementsByClassName(this.CLASS_NAME)
		).find(
			(element) => element.getAttribute(this.ATTR_NAME) === message.userId
		) as HTMLElement | undefined;

		if (message?.path === currentData?.path) {
			if (!pointerElement) {
				pointerElement = document.createElement("div");
				pointerElement.setAttribute(this.ATTR_NAME, message.userId);
				pointerElement.classList.add(this.CLASS_NAME);
				pointerElement.textContent = message.userName;
				pointerElement.style.position = "absolute";
				document.body.appendChild(pointerElement);
			}
			pointerElement.style.left = `${Math.round(
				window.innerWidth * message.x
			)}px`;
			pointerElement.style.top = `${Math.round(
				window.innerHeight * message.y
			)}px`;
		} else if (pointerElement) {
			pointerElement.remove();
		}
	}

	public override destroy(): void {
		Array.from(document.getElementsByTagName(this.ATTR_NAME)).forEach(
			(element) => {
				element.remove();
			}
		);
		super.destroy();
	}
}

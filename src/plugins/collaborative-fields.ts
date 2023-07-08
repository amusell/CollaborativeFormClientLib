import { CollaborativeAbstractPlugin } from "../models/collaborative-plugin.class";
import { IDriveData } from "../models/drive-data.interface";

export class CollaborativeFields extends CollaborativeAbstractPlugin<ICollaborativeFieldEvent> {
	private readonly SUPPORTED_ELEMENTS = ["input", "select", "textarea"];
	public readonly EVENT_NAME = "collaborative-fields";

	protected override registerPlugin() {
		super.registerPlugin();
		document.addEventListener("input", (event) => {
			if (this.isInteractiveEvent(event)) {
				this.eventHandler(event);
			}
		});
		document.addEventListener("focusin", (event) => {
			if (this.isInteractiveEvent(event)) {
				this.eventHandler(event);
			}
		});
		document.addEventListener("focusout", (event) => {
			if (this.isInteractiveEvent(event)) {
				this.sendMessage();
			}
		});
	}

	private isInteractiveEvent(
		event: Event
	): event is (InputEvent | FocusEvent) & { target: HTMLInteractiveElement } {
		return this.isInteractiveElement(event.target as Element);
	}

	private isInteractiveElement(
		element: Element
	): element is HTMLInteractiveElement {
		return this.SUPPORTED_ELEMENTS.includes(
			(element?.tagName || "").toLowerCase()
		);
	}

	private eventHandler(
		event?: (InputEvent | FocusEvent) & { target: HTMLInteractiveElement }
	) {
		if (event?.target) {
			this.sendMessage({
				fieldId:
					event.target.getAttribute("id") || event.target.getAttribute("name"),
				fieldValue: event.target?.value,
			});
		} else {
			this.sendMessage();
		}
	}

	private readonly CLASS_NAME = "collaborative-field";
	private readonly ATTR_NAME = "collaborative-field";
	private readonly TAG_CLASS_NAME = "collaborative-field--user-name";

	protected onMessage(message: ICollaborativeFieldEvent & IDriveData): void {
		const currentData = this.mainDataRetriever();
		let targetElement: Element | undefined;
		if (message?.path && message?.path !== currentData?.path) {
			targetElement = Array.from(document.getElementsByTagName("a"))
				.filter((link) => link.href.includes(message.path))
				.sort(
					(linkA, linkB) =>
						linkA.href.replace(message.path, "").length -
						linkB.href.replace(message.path, "").length
				)?.[0];
		} else if (message?.fieldId) {
			targetElement =
				document.getElementById(message.fieldId) ||
				document.getElementsByName(message.fieldId)?.[0];
			if (
				this.isInteractiveElement(targetElement) &&
				message?.fieldValue !== targetElement?.value
			) {
				targetElement.value = message?.fieldValue as string;
			}
		}

		Array.from(document.getElementsByClassName(this.CLASS_NAME)).forEach(
			(element) => {
				if (element !== targetElement) {
					this.clearEnrichment(element);
				}
			}
		);
		if (targetElement) {
			this.markElement(targetElement, message);
		}
	}

	private clearEnrichment(element: Element) {
		element.removeAttribute(this.ATTR_NAME);
		const sibling = element.nextSibling as Element;
		if (sibling && sibling.classList.contains(this.TAG_CLASS_NAME)) {
			sibling.remove();
		}
		element.classList.remove(this.CLASS_NAME);
	}

	private markElement(
		element: Element,
		message: ICollaborativeFieldEvent & IDriveData
	): void {
		if (
			!element.hasAttribute(this.ATTR_NAME) ||
			element.getAttribute(this.ATTR_NAME) !== message?.userName
		) {
			element.setAttribute(this.ATTR_NAME, message?.userName);
		}
		if (!element.classList.contains(this.CLASS_NAME)) {
			element.classList.add(this.CLASS_NAME);
		}

		const sibling = element.nextSibling as Element;
		if (!sibling || !sibling?.classList?.contains(this.TAG_CLASS_NAME)) {
			element.insertAdjacentHTML(
				"afterend",
				`<span class="${this.TAG_CLASS_NAME}">${message.userName}</span>`
			);
		}
	}
}

type HTMLInteractiveElement =
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement;

export interface ICollaborativeFieldEvent {
	fieldId?: string | null;
	fieldValue?: unknown | undefined;
}

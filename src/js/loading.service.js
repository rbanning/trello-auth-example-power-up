export class LoadingService {
    constructor(target) {
        target = target || ".loading";
        this.elements = window.document.querySelectorAll(target);
    }
    show() {
        if (this.elements instanceof NodeList) {
            this.elements.forEach((node) => {
                node.setAttribute('style', 'display: block;');
            });
        }
    }
    hide() {
        if (this.elements instanceof NodeList) {
            this.elements.forEach((node) => {
                node.setAttribute('style', 'display: none;');
            });
        }
    }
}
//# sourceMappingURL=loading.service.js.map
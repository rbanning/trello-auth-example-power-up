
export class LoadingService {
  elements: NodeList;

  constructor(target?: string) {
    target = target || ".loading";
    this.elements = window.document.querySelectorAll(target);
  }


  show() {
    if (this.elements instanceof NodeList) {
      this.elements.forEach((node: HTMLElement) => {
        node.setAttribute('style', 'display: block;');
      });
    }
  }

  hide() {
    if (this.elements instanceof NodeList) {
      this.elements.forEach((node: HTMLElement) => {
        node.setAttribute('style', 'display: none;');
      });
    }
  }


}

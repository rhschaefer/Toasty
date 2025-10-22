interface IToasty extends HTMLDivElement {
  toastSvg: SVGSVGElement;
  toastInt: SVGPathElement;
  toastContent: HTMLDivElement;
  toastTitle: HTMLDivElement;
  toastText: HTMLDivElement;
  toastStyle: HTMLStyleElement;

  initialTransform: string;
  info(message: string, settings?: IToastySettings): void;
  setConfig(config: IToastySettings): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

type VerticalPosition = "top" | "center" | "bottom";
type HorizontalPosition = "left" | "center" | "right";
type Position = `${VerticalPosition} ${HorizontalPosition}` | "center";

const POS = {
  TOP: "20px",
  LEFT: "20px",
  RIGHT: "20px",
  BOTTOM: "20px",
};

interface IToastySettings {
  position?: Position;
  duration?: number;
}

/**
 * A singleton module for managing and displaying toast notifications.
 * @constructor
 * @function show displays the toast notification
 * @function setConfig set up possible settings for the toast element
 */
export const Toasty = (function () {
  const containers: Partial<Record<Position, HTMLElement>> = {};
  let defaultSettings: IToastySettings = {
    position: "bottom right",
    duration: 3000,
  };

  /**
   * Creates and styles a container element for toast at a specific screen position
   * @param {Position} position - The screen position for the container
   * @returns {HTMLElement} - The created container element
   */
  const createContainer = (position: Position): HTMLElement => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = "9999";
    container.style.pointerEvents = "none";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "0.8rem";

    const [vertical, horizontal] = position.split(" ") as [
      VerticalPosition,
      HorizontalPosition | undefined
    ];

    if (position.includes("top")) container.style.top = POS.TOP;
    if (position.includes("bottom")) container.style.bottom = POS.BOTTOM;
    if (position.includes("left")) container.style.left = POS.LEFT;
    if (position.includes("right")) container.style.right = POS.RIGHT;

    if (position === "center" || (!horizontal && vertical === "center")) {
      container.style.top = "50%";
      container.style.left = "50%";
      container.style.transform = "translate(-50%, -50%)";
    } else if (horizontal === "center") {
      container.style.left = "50%";
      container.style.transform = "translateX(-50%)";
    }

    document.body.appendChild(container);
    containers[position] = container;
    return container;
  };

  /**
   * Creating a basic toast element
   * @param {Position} position - The basic position of the toast element
   * @returns {IToasty} - The basic toast element
   */
  const createElement = (position: Position): IToasty => {
    const toastElement = document.createElement("div") as IToasty;

    //Animation setup
    toastElement.style.transition =
      "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";

    toastElement.initialTransform = "";
    if (position.includes("left"))
      toastElement.initialTransform += "translateX(-100%)";
    else if (position.includes("right"))
      toastElement.initialTransform += "translateX(100%)";
    else if (position.includes("top") || position.includes("bottom"))
      toastElement.initialTransform = "translateX(100%)";
    else toastElement.initialTransform = "scale(0.5)"; //center

    toastElement.style.opacity = "0";
    toastElement.style.transform = toastElement.initialTransform;

    toastElement.style.zIndex = "9999";
    toastElement.style.padding = "0.5rem 1rem 0.8rem 1rem";
    toastElement.style.width = "auto";
    toastElement.style.maxWidth = "20rem";
    toastElement.style.minWidth = "5rem";
    toastElement.style.display = "flex";
    toastElement.style.gap = "0.5rem";
    toastElement.style.justifyContent = "space-between";
    toastElement.style.alignItems = "center";
    toastElement.style.fontSize = "1rem";
    toastElement.style.color = "white";
    toastElement.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    toastElement.style.borderRadius = "0.5rem";
    toastElement.style.padding = "10px;";
    toastElement.style.display = "block";

    toastElement.toastSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    toastElement.toastSvg.setAttribute("viewBox", "0 0 512 512");
    toastElement.toastSvg.setAttribute("width", "15px");
    toastElement.toastSvg.setAttribute("height", "15px");

    toastElement.toastInt = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    toastElement.toastSvg.appendChild(toastElement.toastInt);
    toastElement.appendChild(toastElement.toastSvg);

    toastElement.toastContent = document.createElement("div");
    toastElement.toastTitle = document.createElement("div");
    toastElement.toastTitle.style.color = "white";
    toastElement.toastTitle.style.fontWeight = "500";

    toastElement.toastText = document.createElement("div");
    toastElement.toastText.style.color = "white";

    toastElement.toastContent.appendChild(toastElement.toastTitle);
    toastElement.toastContent.appendChild(toastElement.toastText);
    toastElement.appendChild(toastElement.toastContent);

    return toastElement;
  };

  /**
   * Displays a info toast message on the screen with animation
   * @param {IToasty} toast - created specific toast element to be displayed in the toast
   * @param {IToastySettings} [settings] - Optional settings for the specific toast, overriding the defaults.
   */
  const show = (toast: IToasty, activeSettings: IToastySettings) => {
    const position = activeSettings.position!;

    let container = containers[position];
    if (!container) {
      container = createContainer(position);
    }

    // Animate In
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "none";
      });
    });

    // Animate Out
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = toast.initialTransform;

      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();
          if (container && container.childElementCount === 0) {
            container.remove();
            delete containers[position];
          }
        },
        { once: true }
      );
    }, activeSettings.duration);

    container.appendChild(toast);
  };

  /**
   * Displays a info toast element on the screen with animation
   * @param {string} message - The message to display in the toast
   * @param {IToastySettings} [settings] - Optional settings for the specific toast, overriding the defaults.
   */
  const info = (message: string, settings?: IToastySettings) => {
    const activeSettings = { ...defaultSettings, ...settings };
    const position = activeSettings.position!;

    const toast = createElement(position);
    toast.setAttribute("id", "toast-info");
    toast.style.borderBottom = "1px solid blue";
    toast.toastInt.setAttribute("fill", "blue");
    toast.toastInt.setAttribute(
      "d",
      "M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"
    );
    toast.toastTitle.textContent = "";
    toast.toastText.textContent = message;
    toast.style.display = "flex";

    show(toast, activeSettings);
  };

  /**
   * Displays a success toast element on the screen with animation
   * @param {string} message - The message to display in the toast
   * @param {IToastySettings} [settings] - Optional settings for the specific toast, overriding the defaults.
   */
  const success = (message: string, settings?: IToastySettings) => {
    const activeSettings = { ...defaultSettings, ...settings };
    const position = activeSettings.position!;

    const toast = createElement(position);
    toast.setAttribute("id", "toast-success");
    toast.style.borderBottom = "1px solid green";
    toast.toastInt.setAttribute("fill", "green");
    toast.toastInt.setAttribute(
      "d",
      "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
    );
    toast.toastTitle.textContent = "";
    toast.toastText.textContent = message;
    toast.style.display = "flex";

    show(toast, activeSettings);
  };

  /**
   * Displays a warn toast element on the screen with animation
   * @param {string} message - The message to display in the toast
   * @param {IToastySettings} [settings] - Optional settings for the specific toast, overriding the defaults.
   */
  const warn = (message: string, settings?: IToastySettings) => {
    const activeSettings = { ...defaultSettings, ...settings };
    const position = activeSettings.position!;

    const toast = createElement(position);
    toast.setAttribute("id", "toast-warn");
    toast.style.borderBottom = "1px solid orange";
    toast.toastInt.setAttribute("fill", "orange");
    toast.toastInt.setAttribute(
      "d",
      "M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
    );
    toast.toastTitle.textContent = "";
    toast.toastText.textContent = message;
    toast.style.display = "flex";

    show(toast, activeSettings);
  };

  /**
   * Displays an error toast element on the screen with animation
   * @param {string} message - The message to display in the toast
   * @param {IToastySettings} [settings] - Optional settings for the specific toast, overriding the defaults.
   */
  const error = (message: string, settings?: IToastySettings) => {
    const activeSettings = { ...defaultSettings, ...settings };
    const position = activeSettings.position!;

    const toast = createElement(position);
    toast.setAttribute("id", "toast-error");
    toast.style.borderBottom = "1px solid red";
    toast.toastInt.setAttribute("fill", "red");
    toast.toastInt.setAttribute(
      "d",
      "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"
    );
    toast.toastTitle.textContent = "";
    toast.toastText.textContent = message;
    toast.style.display = "flex";

    show(toast, activeSettings);
  };

  /**
   * Sets the default configuration for all subsequent toasts
   * @param {IToastySettings} settings - An object with settings to override the defaults
   */
  const setConfig = (settings: IToastySettings) => {
    defaultSettings = { ...defaultSettings, ...settings };
  };

  return {
    info,
    success,
    warn,
    error,
    setConfig,
  };
})();

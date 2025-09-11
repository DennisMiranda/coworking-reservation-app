import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export class Notification {
  static showNotification(message: string, config?: Toastify.Options) {
    Toastify({
      text: message,
      duration: 5000,
      newWindow: true,
      close: true,
      gravity: "bottom", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on user interaction
      ...config,
    }).showToast();
  }

  static info(message: string) {
    Notification.showNotification(message, { className: "notification info" });
  }

  static success(message: string) {
    Notification.showNotification(message, {
      className: "notification success",
    });
  }

  static error(message: string) {
    Notification.showNotification(message, { className: "notification error" });
  }

  static warning(message: string) {
    Notification.showNotification(message, {
      className: "notification warning",
    });
  }
}

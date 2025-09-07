export function open(dialogId: string, message?: string) {
  try {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement;
    if (message) {
      const textMessage = document.getElementById(dialogId + "-message");
      if (textMessage) textMessage.innerText = message;
    }
    dialog?.showModal();
  } catch (error) {
    console.error(error);
  }
}

export function cancel(dialogId: string, removeListenerOnFinish = false) {
  try {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement;
    const cancelButton = document.getElementById(
      dialogId + "-cancel"
    ) as HTMLButtonElement;

    const handleCancel = () => {
      dialog.close();
      if (removeListenerOnFinish)
        cancelButton.removeEventListener("click", handleCancel);
    };

    // Form cancel button closes the dialog box
    cancelButton.addEventListener("click", handleCancel);
  } catch (error) {
    console.error(error);
  }
}

export function confirm(
  dialogId: string,
  action: () => Promise<void>,
  loadingMessage?: string,
  removeListenerOnFinish = false
) {
  try {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement;
    const confirmButton = document.getElementById(
      dialogId + "-confirm"
    ) as HTMLButtonElement;
    const handleClick = async () => {
      const form = dialog.querySelector("form");
      const dialogLoadingContainer = document.getElementById(
        dialogId + "-loading-container"
      );
      const dialogLoadingMessage = document.getElementById(
        dialogId + "-loading-message"
      );

      if (loadingMessage) {
        form?.classList.add("hidden");
        dialogLoadingContainer?.classList.remove("hidden");
        if (dialogLoadingMessage)
          dialogLoadingMessage.innerText = loadingMessage;
      }

      await action();
      dialog.close();

      form?.classList.remove("hidden");
      dialogLoadingContainer?.classList.add("hidden");

      if (removeListenerOnFinish)
        confirmButton.removeEventListener("click", handleClick);
    };
    confirmButton.addEventListener("click", handleClick);
  } catch (error) {
    console.error(error);
  }
}

import { useState, useEffect, useCallback } from "react";

// toast component - shows a message at the bottom right of the screen
// use it by calling the show function returned from the hook
function Toast({ message, visible }) {
  return (
    <div className={"toast" + (visible ? " show" : "")}>
      {message}
    </div>
  );
}

// hook that returns [toastProps, showToast]
// showToast("message") will display the toast for 2.5 seconds
function useToast() {
  let [message, setMessage] = useState("");
  let [visible, setVisible] = useState(false);

  let showToast = useCallback(function (msg) {
    setMessage(msg);
    setVisible(true);
    setTimeout(function () {
      setVisible(false);
    }, 2500);
  }, []);

  return [{ message, visible }, showToast];
}

export { Toast, useToast };

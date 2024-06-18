import {useEffect, useRef} from "react";

/**
 * Checks if content in str is numeric
 * https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
 *
 * @param {number|string} str   Number or String which should be checked if it contains numeric content
 */
export function isNumeric(str) {
  if (typeof str === "number") return true
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/**
 * Registers an Event-Listener globally
 * https://javascript.plainenglish.io/how-to-listen-for-key-press-for-document-in-react-js-a2635375bca5
 *
 * @param eventName
 * @param handler
 * @param element
 */
export function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef();  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
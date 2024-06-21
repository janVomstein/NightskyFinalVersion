import {useEffect, useRef} from "react";

/**
 * Checks if content in str is numeric
 * https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
 *
 * @param {number|string} str   Number or String which should be checked if it contains numeric content
 */
export function isNumeric(str) {
  if (typeof str === "number") return !(str === Infinity || str === -1 * Infinity || isNaN(str))
  if (typeof str != "string") return false // we only process strings!
  return !(str === (Infinity).toString() || str === (-1 * Infinity).toString() || isNaN(parseFloat(str)))
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

/**
 * Calculate the scientific Notation of a large/small number
 * @param {number} num - large/small number
 * @returns {[string, string]} - Scientific Notation of num. Format [Base, Exponent]
 */
export function floatToBaseExp(num) {
  if (num === 0.0) {
    return [0.0.toFixed(2), 0.0.toFixed(0)]
  }

  const exp = Math.floor(Math.log10(num));
  const base = num / Math.pow(10, exp);

  return [base.toFixed(2), exp.toFixed(0)];
}

/**
 * Return a Hex-Color-Value for an Integer-ID.
 * @param {number} id - Integer-ID for which the Hex-Color-Value is calculated
 * @returns {string} - Hex-Color-Value for the Integer-ID
 */
export function idToColor(id) {
  let availableColors = ["#ff0000", "#00ff00", "#0000ff", "#00ffff", "#8a2be2", "#808080", "#7fff00", "#5f9ea0", "#8b008b", "#ffd700", "#dcdcdc", "#b22222", "#4b0082", "#ffa07a", "#ff00ff", "#ff6347", "#ffff00", "#b0e0e6"];
  return availableColors[id % availableColors.length];
}

/**
 * Return the RGBA-Representation for a Hex-Color-Value
 * @param {string} hex - Hex-Color-Value
 * @returns {number[]|null} - RGBA-Representation
 */
export function hexToRGB(hex) {
  let regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return regex ? [
    parseInt(regex[1], 16),
    parseInt(regex[2], 16),
    parseInt(regex[3], 16),
    1.0
  ] : null;
}
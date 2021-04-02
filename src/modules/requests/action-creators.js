import { ADD_REQUEST, CLEAR_PLAYLIST } from "./action-types";

export function addRequest(request) {
  return { type: ADD_REQUEST, payload: request };
}
export function clearPalylist() {
	  return { type: CLEAR_PLAYLIST, payload: {} };
}
/* flow */
import type { ActionType } from './types/Action';

export const computeState = (
  actionArray: Array<ActionType>,
  reducer: Function,
  initialState: Object|undefined
) => (
  actionArray.length === 0
  ? undefined
  : actionArray.reduce((state, jsonAction) => {
      const action = JSON.parse(jsonAction);
      return reducer(state, action);
    }, initialState)
);

export type RawActionType = {
  type: string,
  payload: any,
  meta: ?any,
}

export type ActionType = RawActionType & {
  ts: number,
  // TODO: add user_id
}

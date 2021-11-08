export type AnimationDevelopmentAction = ActionBase<'foo', {}>

interface ActionBase<ActionType extends string, ActionPayload extends object> {
  type: ActionType
  actionPayload: ActionPayload
}

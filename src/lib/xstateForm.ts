export type XStateFormEvent<FormState> =
  | { type: 'FIELD_CHANGED'; updates: Partial<FormState> }
  | { type: 'COMMIT_TO_URL' }

export type XStateFormSender<FormState> = (
  event: XStateFormEvent<FormState>,
) => void

export function createXStateFormControls<FormState>(
  send: XStateFormSender<FormState>,
) {
  const updateFields = (updates: Partial<FormState>) => {
    send({ type: 'FIELD_CHANGED', updates })
  }

  const changeField =
    <Key extends keyof FormState>(key: Key) =>
    (value: FormState[Key]) => {
      updateFields({ [key]: value } as Pick<FormState, Key>)
    }

  const commitToUrl = () => {
    send({ type: 'COMMIT_TO_URL' })
  }

  return {
    updateFields,
    changeField,
    commitToUrl,
  }
}

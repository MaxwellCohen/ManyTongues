import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '#/lib/cn'

type FieldContextValue = {
  fieldId: string
  descriptionId: string
  messageId: string
}

const FieldContext = createContext<FieldContextValue | null>(null)

export const fieldLabelClassName = 'mb-1 block text-xs font-medium text-sea-ink-soft'
export const fieldDescriptionClassName = 'mt-1 text-xs text-sea-ink-soft'
export const fieldMessageClassName = 'mt-1 text-sm text-red-600 dark:text-red-400'

type FieldProps = ComponentPropsWithoutRef<'div'> & {
  id?: string
}

function useFieldContext(partName: string) {
  const context = useContext(FieldContext)

  if (!context) {
    throw new Error(`${partName} must be used within a Field.`)
  }

  return context
}

export function Field({ id, className, ...props }: FieldProps) {
  const reactId = useId()
  const fieldId = id ?? reactId
  const value = {
    fieldId,
    descriptionId: `${fieldId}-description`,
    messageId: `${fieldId}-message`,
  }

  return (
    <FieldContext.Provider value={value}>
      <div className={cn('block', className)} {...props} />
    </FieldContext.Provider>
  )
}

export function FieldLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<'label'>) {
  const { fieldId } = useFieldContext('FieldLabel')

  return (
    <label
      className={cn(fieldLabelClassName, className)}
      htmlFor={props.htmlFor ?? fieldId}
      {...props}
    />
  )
}

type FieldControlProps = {
  children: ReactElement
  invalid?: boolean
  describedBy?: string
}

export function FieldControl({
  children,
  invalid = false,
  describedBy,
}: FieldControlProps) {
  const { fieldId, descriptionId, messageId } = useFieldContext('FieldControl')
  const child = Children.only(children)

  if (!isValidElement(child)) {
    return child
  }

  const ariaDescribedBy = describedBy ?? `${descriptionId} ${messageId}`

  return cloneElement(child, {
    id: child.props.id ?? fieldId,
    'aria-describedby': child.props['aria-describedby'] ?? ariaDescribedBy,
    'aria-invalid': child.props['aria-invalid'] ?? (invalid || undefined),
  })
}

export function FieldDescription({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  const { descriptionId } = useFieldContext('FieldDescription')

  if (!children) return null

  return (
    <p
      className={cn(fieldDescriptionClassName, className)}
      id={descriptionId}
      {...props}
    >
      {children as ReactNode}
    </p>
  )
}

export function FieldMessage({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  const { messageId } = useFieldContext('FieldMessage')

  if (!children) return null

  return (
    <p className={cn(fieldMessageClassName, className)} id={messageId} {...props}>
      {children as ReactNode}
    </p>
  )
}

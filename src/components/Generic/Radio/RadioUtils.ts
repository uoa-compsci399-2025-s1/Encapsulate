import type { FieldPath, FieldValues, UseFormRegisterReturn } from 'react-hook-form'

export const forwardSyntheticEvent = (
  event: React.ChangeEvent<HTMLInputElement>,
  registration: UseFormRegisterReturn<FieldPath<FieldValues>>,
  value: string,
) => {
  const syntheticEvent = {
    ...event,
    target: {
      ...event.target,
      name: registration.name,
      value: value,
    },
  }
  registration.onChange(syntheticEvent)
}

import { Label, LabelProps } from './Label'

export interface ButtonProps extends Omit<LabelProps, 'Button'> {}

export function Button(props: ButtonProps) {
  return <Label button {...props} />
}

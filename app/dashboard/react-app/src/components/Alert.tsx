

interface Props{
    text: string
}

export const Alert = ({text}: Props) => {
  return (
    <div className='alert alert-primary'>{text}</div>
  )
}
export default Alert
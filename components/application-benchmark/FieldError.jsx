export default function FieldError({ children, id }) {
  if (!children) return null

  return (
    <p id={id} className="mt-2 text-xs leading-5 text-danger">
      {children}
    </p>
  )
}

export default function Logo({ size = 28 }) {
  return (
    <img
      src="/logo.png"
      alt="Curepay logo"
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  )
}

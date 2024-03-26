import { Delayed } from './Common/Delayed.tsx'

export function BackgroundImage() {
  // delay by 1 second to de-prioritize image loading
  return (
    <Delayed delay={1}>
      <img
        src="/images/wood.jpeg"
        alt="background"
        className={`fixed w-screen h-screen bg-cover`}
        // @ts-ignore
        // eslint-disable-next-line react/no-unknown-property
        fetchpriority="low"
      />
    </Delayed>
  )
}

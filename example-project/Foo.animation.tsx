import React from 'react'
import { AnimationModule } from '../source/models/AnimationModule'

const FooAnimationModule: AnimationModule = {
  animationName: 'Foo',
  frameSize: 512,
  frameCount: 10,
  animationSettings: {
    frameRate: 5,
    constantRateFactor: 1,
  },
  FrameDescriptor: FooFrame,
}

export default FooAnimationModule

interface FooFrameProps {
  frameCount: number
  frameIndex: number
}

function FooFrame(props: FooFrameProps) {
  const { frameCount, frameIndex } = props
  const centerAngle = ((2 * Math.PI) / frameCount) * frameIndex
  return (
    <svg viewBox={`0 0 100 100`}>
      <rect x={0} y={0} width={100} height={100} fill={'black'} />
      <circle
        cx={15 * Math.cos(centerAngle) + 50}
        cy={15 * Math.sin(centerAngle) + 50}
        r={5}
        fill={`rgb(${
          255 * Math.abs(Math.sin(2 * Math.PI * (frameIndex / frameCount)))
        },128,64)`}
      />
    </svg>
  )
}

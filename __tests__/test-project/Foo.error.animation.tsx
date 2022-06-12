import React from 'react'
import { AnimationModule } from '../../source/models/AnimationModule'

const FooAnimationModule: AnimationModule = {
  moduleName: 'Foo',
  frameCount: 10,
  getFrameDescription: getFooFrameDescription,
  frameSize: {
    width: 512,
    height: 512,
  },
  animationSettings: {
    frameRate: 5,
    constantRateFactor: 1,
  },
}

export default FooAnimationModule

interface GetFooFrameDescriptionApi {
  frameCount: number
  frameIndex: number
}

async function getFooFrameDescription(api: GetFooFrameDescriptionApi) {
  const { frameCount, frameIndex } = api
  const centerAngle = ((2 * Math.PI) / frameCount) * frameIndex
  throw 'error for testing'
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

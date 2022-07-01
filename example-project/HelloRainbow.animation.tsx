import React from 'react'
import { AnimationModule } from '../source/models/AnimationModule'
import getColormap from 'colormap'

const HelloRainbowAnimationModule: AnimationModule = {
  moduleName: 'Hello-Rainbow',
  frameCount: 48,
  getFrameDescription: getHelloRainbowFrameDescription,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 12,
    constantRateFactor: 1,
  },
}

export default HelloRainbowAnimationModule

interface GetHelloRainbowFrameDescriptionApi {
  frameCount: number
  frameIndex: number
}

async function getHelloRainbowFrameDescription(
  api: GetHelloRainbowFrameDescriptionApi
) {
  const { frameCount, frameIndex } = api
  const rainbowColormap = getColormap({
    colormap: 'rainbow-soft',
    nshades: frameCount,
    format: 'hex',
    alpha: 1,
  })
  const mainFrameColor = rainbowColormap[frameIndex % frameCount]
  return (
    <svg viewBox={`0 0 100 100`}>
      <rect
        x={0}
        y={0}
        width={100}
        height={100}
        fill={'black'}
        stroke={mainFrameColor}
        strokeWidth={1}
      />
      <text
        x={5}
        y={9}
        style={{
          fontFamily: 'monospace',
          fontSize: 5,
          fill: mainFrameColor,
        }}
      >
        Hello Rainbow
      </text>
      {new Array(frameCount).fill(null).map((_, circleIndex) => {
        const circleStamp = circleIndex / frameCount
        return (
          <circle
            cx={50}
            cy={50}
            r={30 - 30 * Math.sin(circleStamp * (Math.PI / 2))}
            fill={rainbowColormap[(circleIndex + frameIndex) % frameCount]}
          />
        )
      })}
    </svg>
  )
}

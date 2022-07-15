import React from 'react'
import { AnimationModule } from '../source/models/AnimationModule'
import getColormap from 'colormap'

const HelloRainbowAnimationModule: AnimationModule = {
  moduleName: 'Hello-Rainbow',
  frameCount: 24,
  getFrameDescription: getHelloRainbowFrameDescription,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 9,
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
        strokeWidth={2}
      />
      <text
        x={5}
        y={9}
        style={{
          fontFamily: 'monospace',
          fontSize: 5,
          fontWeight: 600,
          fill: mainFrameColor,
        }}
      >
        Hello Rainbow
      </text>
      {new Array(frameCount).fill(null).map((_, squareIndex) => {
        const squareStamp = squareIndex / frameCount
        const squareRadius = 30 - 30 * squareStamp
        const squareLength = 2 * squareRadius
        return (
          <rect
            x={50 - squareRadius}
            y={50 - squareRadius}
            width={squareLength}
            height={squareLength}
            stroke={rainbowColormap[(squareIndex + frameIndex) % frameCount]}
            strokeWidth={0.5}
          />
        )
      })}
    </svg>
  )
}

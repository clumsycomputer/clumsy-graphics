# graphics-renderer

this repository provides tooling for rendering animations where frames are described using svg elements à la react 🙃

## example

#### tl;dr

![TL;DR Hello Rainbow Animation Gif](/assets/HelloRainbow.tl;dr.gif)

#### ./example-project/HelloRainbow.animation.tsx

```typescript
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
        strokeWidth={2}
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
```

#### develop and iterate on animation

```bash
yarn graphics-renderer startDevelopment --animationModulePath=./example-project/HelloRainbow.animation.tsx
```

#### render animation as mp4

```bash
yarn graphics-renderer renderAnimation --animationModulePath=./example-project/HelloRainbow.animation.tsx --animationMp4OutputPath=./example-project/HelloRainbow.mp4"
```

#### convert animation to gif

```bash
yarn graphics-renderer convertAnimationToGif --animationMp4SourcePath=./example-project/HelloRainbow.mp4 --animationGifOutputPath=./example-project/HelloRainbow.gif --gifAspectRatioWidth=512
```

#### ./example-project/HelloRainbow.gif

![Hello Rainbow Animation Gif](/assets/HelloRainbow.gif)

## installation

#### add package to project

```bash
yarn add graphics-renderer
```

#### setup docker

install and run [docker engine](https://docs.docker.com/engine/install/) _(the majority of `graphics-renderer` runs within a container to simplify dependency management)_

## commands

### startDevelopment

> graphics-renderer startDevelopment --animationModulePath=\<SourceFilePath>

#### api

- **`animationModulePath`:** path to animation module export file

  - required

- **`clientServerPort`:** the port on the host machine to use for handling api, asset, and page requests

  - defaultValue = _3000_

- **`generatedAssetsDirectoryPath`:** path to directory where requested assets will live

  - defaultValue = _Path.resolve(\_\_dirname, './developmentAssets')_

- **`numberOfFrameRendererWorkers`:** the number of workers to allocate for rendering frames

  - defaultValue = _numberOfCpuCores - 2_

#### how-to

- run _startDevelopment_ command

- open browser at `localhost:3000`

- begin making changes on the active animation module

### renderAnimation

> graphics-renderer renderAnimation --animationModulePath=\<SourceFilePath> --animationMp4OutputPath=\<DirectoryPath>

#### api

- **`animationModulePath`:** path to animation module export file

  - required

- **`animationMp4OutputPath`:** path to write _.mp4_ file

  - required

- **`numberOfFrameRendererWorkers`:** the number of workers to allocate for rendering frames

  - defaultValue = _numberOfCpuCores - 1_

### renderAnimationFrame

> graphics-renderer renderAnimationFrame --animationModulePath=\<SourceFilePath> --frameFileOutputPath=\<FrameFilePath> --frameIndex=\<NaturalNumber>

#### api

- **`animationModulePath`:** path to animation module export file

  - required

- **`frameFileOutputPath`:** path to write frame file

  - required

  - file type can be _**svg**_ or _**png**_

- **`frameIndex`:** the index of the frame to render

  - required

### convertAnimationToGif

> graphics-renderer convertAnimationToGif --animationMp4SourcePath=\<AnimationFilePath> --animationGifOutputPath=\<GifFilePath>

#### api

- **`animationMp4SourcePath`:** path of _.mp4_ file

  - required

- **`animationGifOutputPath`:** path to write _.gif_ file

  - required

- **`gifAspectRatioWidth`:** width of _.gif_ file in pixels

  - defaultValue = _widthOfSourceMp4_

  - aspect ratio will be preserved

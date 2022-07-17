# clumsy-graphics

a tool for rapidly developing animations where frames are described using svg elements à la react 🙃

## example

#### tl;dr

![TL;DR Hello Rainbow Animation Gif](/assets/HelloRainbow.gif)

#### ./example-project/HelloRainbow.animation.tsx

```typescript
import React from 'react'
import { AnimationModule } from 'clumsy-graphics'
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
```

#### develop and iterate on animation

```bash
yarn clumsy-graphics startDevelopment --animationModulePath=./example-project/HelloRainbow.animation.tsx
```

open browser at `localhost:3000`

#### ./example-project/HelloRainbow.gif

![Hello Rainbow Animation Gif](/assets/HelloRainbow.gif)

## installation

#### add package to project

```bash
yarn add clumsy-graphics
```

#### setup docker

install and run [docker engine](https://docs.docker.com/engine/install/) _(the majority of `clumsy-graphics` runs within a container to simplify dependency management)_

## commands

### startDevelopment

> clumsy-graphics startDevelopment --animationModulePath=\<SourceFilePath>

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

> clumsy-graphics renderAnimation --animationModulePath=\<SourceFilePath> --animationMp4OutputPath=\<DirectoryPath>

#### api

- **`animationModulePath`:** path to animation module export file

  - required

- **`animationMp4OutputPath`:** path to write _.mp4_ file

  - required

- **`numberOfFrameRendererWorkers`:** the number of workers to allocate for rendering frames

  - defaultValue = _numberOfCpuCores - 1_

### renderAnimationFrame

> clumsy-graphics renderAnimationFrame --animationModulePath=\<SourceFilePath> --frameFileOutputPath=\<FrameFilePath> --frameIndex=\<NaturalNumber>

#### api

- **`animationModulePath`:** path to animation module export file

  - required

- **`frameFileOutputPath`:** path to write frame file

  - required

  - file type can be _**svg**_ or _**png**_

- **`frameIndex`:** the index of the frame to render

  - required

### convertAnimationToGif

> clumsy-graphics convertAnimationToGif --animationMp4SourcePath=\<AnimationFilePath> --animationGifOutputPath=\<GifFilePath>

#### api

- **`animationMp4SourcePath`:** path of _.mp4_ file

  - required

- **`animationGifOutputPath`:** path to write _.gif_ file

  - required

- **`gifAspectRatioWidth`:** width of _.gif_ file in pixels

  - defaultValue = _widthOfSourceMp4_

  - aspect ratio will be preserved

# graphics-renderer

this repository provides tooling for rendering animations where frames are described using svg elements à la react 🙃

## example

#### ./example-project/Foo.animation.tsx

```typescript
import React from 'react'
import { AnimationModule } from '@clumsycomputer/graphics-renderer'

const FooAnimationModule: AnimationModule = {
  moduleName: 'Foo',
  frameCount: 10,
  getFrameDescription: getFooFrameDescription,
  frameSize: {
    width: 1024,
    height: 1024,
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
```

#### develop and iterate on animation

```bash
yarn graphics-renderer startDevelopment --animationModulePath=./example-project/Foo.animation.tsx
```

#### render animation as mp4

```bash
yarn graphics-renderer renderAnimation --animationModulePath=./example-project/Foo.animation.tsx --animationMp4OutputPath=./example-project/foo.mp4"
```

#### convert animation to gif

```bash
yarn graphics-renderer convertAnimationToGif --animationMp4SourcePath=./example-project/foo.mp4 --animationGifOutputPath=./example-project/foo.gif --gifAspectRatioWidth=512
```

#### ./example-project/foo.gif

![Foo Animation Gif](/assets/foo.gif)

## installation

#### add package to project

```bash
yarn add @clumsycomputer/graphics-renderer
```

#### setup docker

install and run docker _(the majority of `graphics-renderer` runs within a container to simplify)_

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

- open browser at development service with a valid query string detailing desired asset

  - schema: `localhost:<ClientServerPort>(/animation | /frame/<FrameIndex>)(/logs | /result)`

  - animation example: `localhost:3000/animation/result`

  - frame example: `localhost:3000/frame/0/result`

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

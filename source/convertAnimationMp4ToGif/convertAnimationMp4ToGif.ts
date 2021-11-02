import ChildProcess from 'child_process'

export interface ConvertAnimationMp4ToGifApi {
  animationMp4SourcePath: string
  animationGifOutputPath: string
  gifAspectRatioWidth?: number
}

export function convertAnimationMp4ToGif(api: ConvertAnimationMp4ToGifApi) {
  const {
    animationMp4SourcePath,
    animationGifOutputPath,
    gifAspectRatioWidth,
  } = api
  // https://superuser.com/questions/556029/how-do-i-convert-a-video-to-gif-using-ffmpeg-with-reasonable-quality
  const aspectRatioScaleOption = gifAspectRatioWidth
    ? `scale=${gifAspectRatioWidth}:-1:flags=lanczos,`
    : ''
  ChildProcess.execSync(`
    ffmpeg \
      -y \
      -i ${animationMp4SourcePath} \
      -vf "${aspectRatioScaleOption}split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
      -loop 0 \
      ${animationGifOutputPath}
  `)
}

import ChildProcess from 'child_process'
import FileSystem from 'fs'

beforeAll(() => {
  FileSystem.rmSync('./test-temp', {
    recursive: true,
    force: true,
  })
})

describe('graphics-renderer', () => {
  describe('renderAnimation', () => {
    test('renderAnimation outputs expected "foo.mp4"', () => {
      ChildProcess.execSync(
        'graphics-renderer renderAnimation --animationModulePath=./example-project/Foo.animation.tsx --outputDirectoryPath=./test-temp --numberOfFrameRendererWorkers=7'
      )
      expect(
        ChildProcess.spawnSync(
          'ffprobe',
          ['-show_frames', './test-temp/foo.mp4'],
          { stdio: 'pipe' }
        ).stdout.toString()
      ).toMatchSnapshot()
    })
  })
  describe('convertAnimationToGif', () => {
    test('convertAnimationToGif outputs expected "foo.gif"', () => {
      ChildProcess.execSync(
        'graphics-renderer renderAnimation --animationModulePath=./example-project/Foo.animation.tsx --outputDirectoryPath=./test-temp'
      )
      ChildProcess.execSync(
        'graphics-renderer convertAnimationToGif --animationMp4SourcePath=./test-temp/foo.mp4 --animationGifOutputPath=./test-temp/foo.gif --gifAspectRatioWidth=512'
      )
      expect(
        ChildProcess.spawnSync(
          'ffprobe',
          ['-show_frames', './test-temp/foo.gif'],
          { stdio: 'pipe' }
        ).stdout.toString()
      ).toMatchSnapshot()
    })
  })
})

afterEach(() => {
  FileSystem.rmSync('./test-temp', {
    recursive: true,
    force: true,
  })
})

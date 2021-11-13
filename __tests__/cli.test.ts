import ChildProcess from 'child_process'
import FileSystem from 'fs'

beforeAll(() => {
  FileSystem.rmSync('./test-temp', {
    recursive: true,
    force: true,
  })
  FileSystem.mkdirSync('./test-temp')
})

describe('graphics-renderer', () => {
  describe('renderAnimation', () => {
    test('renderAnimation outputs expected "foo.mp4"', () => {
      ChildProcess.execSync(
        'graphics-renderer renderAnimation --animationModulePath=./example-project/Foo.animation.tsx --animationMp4OutputPath=./test-temp/foo.mp4 --numberOfFrameRendererWorkers=7'
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
  describe('renderAnimationFrame', () => {
    test('renderAnimationFrame outputs expected "foo_0.svg"', () => {
      ChildProcess.execSync(
        'graphics-renderer renderAnimationFrame --animationModulePath=./example-project/Foo.animation.tsx --frameFileOutputPath=./test-temp/foo_0.svg --frameIndex=0'
      )
      expect(
        FileSystem.readFileSync('./test-temp/foo_0.svg')
          .toString()
          .replace(/sodipodi:docname="(.)+\.svg"/m, '')
      ).toMatchSnapshot()
    })
    test('renderAnimationFrame outputs expected "foo_0.png"', () => {
      ChildProcess.execSync(
        'graphics-renderer renderAnimationFrame --animationModulePath=./example-project/Foo.animation.tsx --frameFileOutputPath=./test-temp/foo_0.png --frameIndex=0'
      )
      expect(
        ChildProcess.spawnSync(
          'ffprobe',
          ['-show_frames', './test-temp/foo_0.png'],
          { stdio: 'pipe' }
        ).stdout.toString()
      ).toMatchSnapshot()
    })
  })
  describe('convertAnimationToGif', () => {
    test('convertAnimationToGif outputs expected "foo.gif"', () => {
      ChildProcess.execSync(
        'graphics-renderer renderAnimation --animationModulePath=./example-project/Foo.animation.tsx --animationMp4OutputPath=./test-temp/foo.mp4'
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

afterAll(() => {
  FileSystem.rmSync('./test-temp', {
    recursive: true,
    force: true,
  })
})

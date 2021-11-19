import ChildProcess from 'child_process'
import FileSystem from 'fs'
import { test, expect } from '@playwright/test'

test.describe('graphics-renderer', () => {
  const testAnimationModulePath = './__tests__/test-project/Foo.animation.tsx'
  test.beforeAll(() => {
    FileSystem.rmSync('./test-temp', {
      recursive: true,
      force: true,
    })
    FileSystem.mkdirSync('./test-temp')
  })
  test.afterAll(() => {
    FileSystem.rmSync('./test-temp', {
      recursive: true,
      force: true,
    })
  })
  test.describe('renderAnimation', () => {
    test('renderAnimation outputs expected "foo.mp4"', () => {
      ChildProcess.execSync(
        `graphics-renderer renderAnimation --animationModulePath=${testAnimationModulePath} --animationMp4OutputPath=./test-temp/foo.mp4 --numberOfFrameRendererWorkers=7`
      )
      expect(
        ChildProcess.spawnSync(
          'ffprobe',
          ['-show_frames', './test-temp/foo.mp4'],
          { stdio: 'pipe' }
        ).stdout.toString()
      ).toMatchSnapshot('animationMp4FramesSnapshot')
    })
  })
  test.describe('renderAnimationFrame', () => {
    test('renderAnimationFrame outputs expected "foo_0.svg"', () => {
      ChildProcess.execSync(
        `graphics-renderer renderAnimationFrame --animationModulePath=${testAnimationModulePath} --frameFileOutputPath=./test-temp/foo_0.svg --frameIndex=0`
      )
      expect(
        FileSystem.readFileSync('./test-temp/foo_0.svg')
          .toString()
          .replace(/sodipodi:docname="(.)+\.svg"/m, '')
      ).toMatchSnapshot('frameSvgSnapshot')
    })
    test('renderAnimationFrame outputs expected "foo_0.png"', () => {
      ChildProcess.execSync(
        `graphics-renderer renderAnimationFrame --animationModulePath=${testAnimationModulePath} --frameFileOutputPath=./test-temp/foo_0.png --frameIndex=0`
      )
      expect(
        ChildProcess.spawnSync(
          'ffprobe',
          ['-show_frames', './test-temp/foo_0.png'],
          { stdio: 'pipe' }
        ).stdout.toString()
      ).toMatchSnapshot('framePngFramesSnapshot')
    })
  })
  test.describe('convertAnimationToGif', () => {
    test('convertAnimationToGif outputs expected "foo.gif"', () => {
      ChildProcess.execSync(
        `graphics-renderer renderAnimation --animationModulePath=${testAnimationModulePath} --animationMp4OutputPath=./test-temp/foo.mp4`
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
      ).toMatchSnapshot('animationGifFramesSnapshot')
    })
  })
  test.describe('startAnimationDevelopment', () => {
    let spawnedDevelopmentProcess: ChildProcess.ChildProcess | null = null
    test.beforeAll(async () => {
      spawnedDevelopmentProcess = ChildProcess.spawn('graphics-renderer', [
        'startDevelopment',
        `--animationModulePath=${testAnimationModulePath}`,
      ])
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    })
    test.afterAll(() => {
      spawnedDevelopmentProcess!.kill('SIGINT')
    })
    test('startAnimationDevelopment renders and serves animation asset', async ({
      page,
    }) => {
      await page.goto('localhost:3000/?assetType=mp4')
      const assetResponse = await page.waitForResponse('**/asset/0.mp4')
      expect(await assetResponse.headerValues('Content-Type')).toEqual([
        'video/mp4',
      ])
    })
    test('startAnimationDevelopment renders and serves frame asset', async ({
      page,
    }) => {
      await page.goto('localhost:3000/?assetType=png&frameIndex=0')
      const assetResponse = await page.waitForResponse('**/asset/0_0.png')
      expect(await assetResponse.headerValues('Content-Type')).toEqual([
        'image/png',
      ])
    })
  })
})

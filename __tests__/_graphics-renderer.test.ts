import ChildProcess from 'child_process'
import FileSystem from 'fs'
import { test, expect } from '@playwright/test'

test.describe('_graphics-renderer', () => {
  const testProjectDirectoryPath = './__tests__/test-project'
  const testAnimationModulePath = `${testProjectDirectoryPath}/Foo.animation.tsx`
  test.beforeAll(() => {
    FileSystem.rmSync('./test-temp', {
      recursive: true,
      force: true,
    })
    FileSystem.mkdirSync('./test-temp')
    FileSystem.writeFileSync(
      testAnimationModulePath,
      FileSystem.readFileSync(
        `${testProjectDirectoryPath}/Foo.initial.animation.tsx`,
        { encoding: 'utf-8' }
      )
    )
  })
  test.afterAll(() => {
    FileSystem.rmSync('./test-temp', {
      recursive: true,
      force: true,
    })
    FileSystem.rmSync(testAnimationModulePath)
  })
  test.describe('renderAnimation', () => {
    test('renderAnimation outputs expected "foo.mp4"', () => {
      ChildProcess.execSync(
        `_graphics-renderer renderAnimation --animationModulePath=${testAnimationModulePath} --animationMp4OutputPath=./test-temp/foo.mp4 --numberOfFrameRendererWorkers=7`
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
        `_graphics-renderer renderAnimationFrame --animationModulePath=${testAnimationModulePath} --frameFileOutputPath=./test-temp/foo_0.svg --frameIndex=0`
      )
      expect(
        FileSystem.readFileSync('./test-temp/foo_0.svg')
          .toString()
          .replace(/sodipodi:docname="(.)+\.svg"/m, '')
      ).toMatchSnapshot('frameSvgSnapshot')
    })
    test('renderAnimationFrame outputs expected "foo_0.png"', () => {
      ChildProcess.execSync(
        `_graphics-renderer renderAnimationFrame --animationModulePath=${testAnimationModulePath} --frameFileOutputPath=./test-temp/foo_0.png --frameIndex=0`
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
        `_graphics-renderer renderAnimation --animationModulePath=${testAnimationModulePath} --animationMp4OutputPath=./test-temp/foo.mp4`
      )
      ChildProcess.execSync(
        '_graphics-renderer convertAnimationToGif --animationMp4SourcePath=./test-temp/foo.mp4 --animationGifOutputPath=./test-temp/foo.gif --gifAspectRatioWidth=512'
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
      spawnedDevelopmentProcess = ChildProcess.spawn('_graphics-renderer', [
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
    // test('redirects to "/animation/logs" from "/"', async ({ page }) => {
    //   await page.goto('localhost:3000')
    //   await page
    //     .locator('text="animation" >> nth=0')
    //     .waitFor({ state: 'visible' })
    //   await expect(page).toHaveURL('http://localhost:3000/animation/logs')
    // })
    // test('displays animation process logs', async ({ page }) => {
    //   await page.goto('localhost:3000/animation/logs')
    //   expect(
    //     await page
    //       .locator('text="view rendered asset >"')
    //       .waitFor({ state: 'visible' })
    //   )
    // })
    // test('renders animation asset', async ({ page }) => {
    //   await page.goto('localhost:3000/animation/result')
    //   const animationAssetResponse = await page.waitForResponse(
    //     '**/asset/0.mp4'
    //   )
    //   expect(await animationAssetResponse.headerValues('Content-Type')).toEqual(
    //     ['video/mp4']
    //   )
    // })
    // test.only('displays frame process logs', async ({ page }) => {
    //   await page.goto('localhost:3000/frame/0/logs')
    //   expect(
    //     await page
    //       .locator('text="view rendered asset >"')
    //       .waitFor({ state: 'visible' })
    //   )
    // })
    // test('renders frame asset', async ({ page }) => {
    //   await page.goto('localhost:3000/frame/0/result')
    //   const animationAssetResponse = await page.waitForResponse(
    //     '**/asset/0_0.png'
    //   )
    //   expect(await animationAssetResponse.headerValues('Content-Type')).toEqual(
    //     ['image/png']
    //   )
    // })
    // test('supports keyboard interaction', async ({ page }) => {
    //   await page.goto('localhost:3000/animation/logs')
    //   await page
    //     .locator('text="view rendered asset >"')
    //     .waitFor({ state: 'visible' })
    //   await page
    //     .locator('body > div > div > div >> nth=2')
    //     .evaluate((someElement: any) => {
    //       someElement.setAttribute('style', 'color: white;')
    //     })
    //   await page.keyboard.press('Tab')
    //   await expect(page).toHaveScreenshot('focusedAssetRouteSelect.png')
    //   await page.keyboard.press('Tab')
    //   await expect(page).toHaveScreenshot('focusedResultOption.png')
    //   await page
    //     .locator('text="view rendered asset >"')
    //     .waitFor({ state: 'visible' })
    //   await page.keyboard.press('Tab')
    //   await expect(page).toHaveScreenshot('focusedViewResultLink.png')
    //   await page.keyboard.press('Enter')
    //   await expect(page).toHaveURL('http://localhost:3000/animation/result')
    //   await page
    //     .locator('text="animation" >> nth=0')
    //     .waitFor({ state: 'visible' })
    //   await page.keyboard.press('Tab')
    //   await page.keyboard.press('Enter')
    //   await page.keyboard.type('2')
    //   await page.keyboard.press('Enter')
    //   await expect(page).toHaveURL('http://localhost:3000/frame/2/result')
    //   await page
    //     .locator('text="frame/2" >> nth=0')
    //     .waitFor({ state: 'visible' })
    //   await page.keyboard.press('Tab')
    //   await page.keyboard.press('Tab')
    //   await page.keyboard.press('Enter')
    //   await expect(page).toHaveURL('http://localhost:3000/frame/2/logs')
    // })
    // test('handles module updates', async ({ page }) => {
    //   await page.goto('localhost:3000/frame/0/logs')
    //   FileSystem.writeFileSync(
    //     testAnimationModulePath,
    //     FileSystem.readFileSync(
    //       `${testProjectDirectoryPath}/Foo.error.animation.tsx`,
    //       { encoding: 'utf-8' }
    //     )
    //   )
    //   await page.locator('text="view render error >"').click()
    //   await page
    //     .locator('text="frame/0" >> nth=0')
    //     .waitFor({ state: 'visible' })
    //   await expect(page).toHaveScreenshot('errorResultPage.png')
    //   FileSystem.writeFileSync(
    //     testAnimationModulePath,
    //     FileSystem.readFileSync(
    //       `${testProjectDirectoryPath}/Foo.update.animation.tsx`,
    //       { encoding: 'utf-8' }
    //     )
    //   )
    //   const animationAssetResponse = await page.waitForResponse(
    //     '**/asset/2_0.png'
    //   )
    //   expect(await animationAssetResponse.headerValues('Content-Type')).toEqual(
    //     ['image/png']
    //   )
    // })
  })
})

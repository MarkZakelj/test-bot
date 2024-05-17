const config = require('./config')
const axios = require('axios')
const puppeteer = require('puppeteer')
const puppeteer_config = {
  headless: !config.watch_bot_live,
  args: [],
}

;(async () => {
  const like_wish = config.like_wish
  const event_code = config.event_code
  const qid = config.question_id
  const res = await fetchUUID(event_code)
  const uuid = res.uuid

  if (res.error) {
    console.log('🔻 Event not found.')
    return
  }

  const browser = await puppeteer.launch(puppeteer_config)
  const page = await browser.newPage()

  for (let index = 0; index < like_wish; index++) {
    await page.goto(`https://app.sli.do/event/${event_code}/live/polls`)
    await page.setViewport({ width: 1200, height: 800 })

    await page.waitForSelector('.app__content__body')

    console.log('🔸 Looking for question...')

    await page.waitForSelector('.poll-question-options')

    if (config.safe_wait) {
      await page.evaluate(async () => {
        await new Promise(function (resolve) {
          setTimeout(resolve, config.safe_wait_timer)
        })
      })
    }

    autoScroll(page)

    await page.waitForSelector(`#live-tabpanel-polls > div > div > div.poll--survey > form > div:nth-child(1) > div:nth-child(1) > div > div.poll-question__body-container > div > div.poll-question__body > div > label:nth-child(1) > span.MuiButtonBase-root.MuiIconButton-root.jss2.MuiRadio-root.MuiRadio-colorSecondary.MuiIconButton-colorSecondary`)

    console.log('🔹 Question found')
    await page.waitForTimeout(Math.floor(Math.random() * 800) + 500)
    const btn = await page.$(`#live-tabpanel-polls > div > div > div.poll--survey > form > div:nth-child(1) > div:nth-child(1) > div > div.poll-question__body-container > div > div.poll-question__body > div > label:nth-child(1) > span.MuiButtonBase-root.MuiIconButton-root.jss2.MuiRadio-root.MuiRadio-colorSecondary.MuiIconButton-colorSecondary`)
    await btn.evaluate((btn) => btn.click())

    // select random number from 1 to 3
    let randomNumber = Math.floor(Math.random() * 3) + 1;
    console.log(randomNumber)
    await page.waitForSelector(`#live-tabpanel-polls > div > div > div.poll--survey > form > div:nth-child(1) > div:nth-child(2) > div > div.poll-question__body-container > div > div.poll-question__body > div > label:nth-child(${randomNumber}) > span.MuiButtonBase-root.MuiIconButton-root.jss2.MuiRadio-root.MuiRadio-colorSecondary.MuiIconButton-colorSecondary`)
    const btn2 = await page.$(`#live-tabpanel-polls > div > div > div.poll--survey > form > div:nth-child(1) > div:nth-child(2) > div > div.poll-question__body-container > div > div.poll-question__body > div > label:nth-child(${randomNumber}) > span.MuiButtonBase-root.MuiIconButton-root.jss2.MuiRadio-root.MuiRadio-colorSecondary.MuiIconButton-colorSecondary`)
    await page.waitForTimeout(Math.floor(Math.random() * 800) + 500)
    await btn2.evaluate((btn2) => btn2.click())

    await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000)
    // await page.waitForResponse(`https://app.sli.do/eu1/api/v0.5/events/${uuid}/questions/${qid}/like`)
    const submit_btn_selector = '.poll__btn-submit';
    await page.waitForSelector(submit_btn_selector);
    const submit_btn = await page.$(submit_btn_selector);
    await submit_btn.evaluate((submit_btn) => submit_btn.click());


    console.log(`💚 Liked! (${index + 1}/${like_wish})`)

    await page.deleteCookie({
      name: 'AWSALBCORS',
      domain: 'app.sli.do',
    })

    await page.deleteCookie({
      name: 'AWSALB',
      domain: 'app.sli.do',
    })

    await page.deleteCookie({
      name: 'Slido.EventAuthTokens',
      domain: 'app.sli.do',
    })
    console.log('🔹 Waiting random time...')
    await page.waitForTimeout(Math.floor(Math.random() * 800) + 500)
    console.log('🔹 Done!')
  }
  // wait random time
  await browser.close()
})()

function autoScroll(page) {
  page.evaluate(() => {
    let totalHeight = 0
    const distance = 100
    const timer = setInterval(() => {
      let scrollHeight = document.body.scrollHeight
      window.scrollBy(0, distance)
      totalHeight += distance

      if (totalHeight >= scrollHeight - window.innerHeight) {
        clearInterval(timer)
      }
    }, 200)
  })
}

async function fetchUUID(event_code) {
  try {
    const res = await axios({
      method: 'GET',
      url: `https://app.sli.do/eu1/api/v0.5/app/events?hash=${event_code}`,
      headers: { 'accept-encoding': '*' },
    })

    return {
      error: false,
      uuid: res.data.uuid,
    }
  } catch (error) {
    return {
      error: true,
      uuid: '',
    }
  }
}

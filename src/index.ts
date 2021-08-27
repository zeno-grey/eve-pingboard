import { getApp } from './app'

async function main() {
  const app = getApp()

  const port = process.env.PORT ?? '3000'
  await new Promise<void>(res => app.listen(parseInt(port), res))

  console.log(`Listening on port ${port}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})

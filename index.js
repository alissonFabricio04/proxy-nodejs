import { createServer } from 'node:http'
import { request } from 'node:https'
import { parse } from 'node:url'

const PORT = process.env.PORT || 80

const server = createServer(async (req, res) => {
  const requestedUrl = parse(req.url, true).query.url

  if (!requestedUrl) {
    res.statusCode = 400
    return res.end('Parâmetro "url" ausente')
  }

  const proxyReq = request(requestedUrl, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)

    proxyRes.on('data', (chunk) => {
      res.write(chunk)
    })

    proxyRes.on('end', () => {
      res.end()
    })
  })

  proxyReq.on('error', () => {
    console.error('Erro na requisição proxy:', err)
    res.statusCode = 500
    res.end('Erro interno')
  })

  proxyReq.end()
})
  .listen(PORT)
  .on('listening', _ => console.log(`Server is runnig at PORT ${PORT}`))


process.on('uncaughtException', () => { })
process.on('unhandledRejection', () => { })
process.on('SIGTERM', () => {
  return event => {
    console.info(`${event} signal received with code ${event}`)
    console.log('Closing http server...')
    server.close(async () => {
      console.log('Http server closed.')
      process.exit(0)
    })
  }
})

// module dependencies
const path = require('path')

// dotenv file support
require('dotenv').config({ path: path.join(__dirname, '.env') })

// rest of dependencies
const axios = require('axios')

// initialize cloudflare
const cf = require('cloudflare')({
  token: process.env.CLOUDFLARE_TOKEN
})

// cache object
const cache = {}

// get public ip address of current network
async function getPublicIP () {
  const res = await axios.get('https://ipv4.icanhazip.com')

  // return res.data
  return res.data.replace('\n', '')
}

// get ip address of cloudflare dns record
async function getCloudflareIP () {
  // check cache
  const now = new Date()
  if (cache.cloudflareIP && cache.cloudflareIP.expiresAt > now) {
    console.info('retrieved cloudflare dns record ip from cache')
    return cache.cloudflareIP.value
  }

  // get dns record
  const { result } = await cf.dnsRecords.read(
    process.env.CLOUDFLARE_ZONE,
    process.env.CLOUDFLARE_RECORD
  )

  // validate dns record
  if (result.type !== 'A') {
    const err = new Error('Must be an A record')
    throw err
  }

  const value = result.content

  // cache result
  const expiresAt = new Date()
  expiresAt.setTime(expiresAt.getTime() + (60 * 60 * 1000))
  cache.cloudflareIP = { value, expiresAt }

  return value
}

async function updateCloudflareIP (ip) {
  // update dns record
  return cf.dnsRecords.edit(
    process.env.CLOUDFLARE_ZONE,
    process.env.CLOUDFLARE_RECORD,
    { ...result, content: ip }
  )
}

const interval = 1 * 60 * 1000
async function loop () {
  return Promise.all([
    getPublicIP(),
    getCloudflareIP()
  ]).then(([ ip, cloudflareIP ]) => {
    // check if dns record needs an update 
    if (ip === cloudflareIP) {
      console.info('no need for dns update')
    } else {
      // update dns record
      return updateCloudflareIP(ip).then(() => {
        console.info('dns record now points to %s', ip)
      })
    }
  }).catch(err => {
    console.error('an error occured')
    console.error(err)
  }).finally(() => {
    setTimeout(loop, interval)
  })
}

loop()
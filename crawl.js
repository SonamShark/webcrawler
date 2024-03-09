const { JSDOM } = require('jsdom')

async function crawlPage(currentURL){
    console.log(`actively crawling: ${currentURL}`)

    try{
        const resp = await fetch(currentURL)

        if(resp.status > 399){
            console.log(`error in fetch with status code: ${resp.status} on page: ${currentURL}`)
            return 
        }

        const contentType = resp.headers.get("content-type")
        if(!contentType.includes("text/html")){
          console.log(`non html response, content type: ${contentType}, on page: ${currentURL}`)
          return 
        }
        
        console.log(await resp.text())
    } catch(err){
        console.log(`error in fetch: ${err.message}, on page: ${currentURL}`)
    }
}

function getURLsFromHTML(htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const aElements = dom.window.document.querySelectorAll('a')
    for (const aElement of aElements){
      if (aElement.href.slice(0,1) === '/'){
        try {
          urls.push(new URL(aElement.href, baseURL).href)
        } catch (err){
          console.log(`${err.message}: ${aElement.href}`)
        }
      } else {
        try {
          urls.push(new URL(aElement.href).href)
        } catch (err){
          console.log(`${err.message}: ${aElement.href}`)
        }
      }
    }
    return urls
  }


function normalizeURL(urlString){
    const urlObj = new URL(urlString) 
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`

    if(hostPath.length > 0 && hostPath.slice(-1) == '/'){
        return hostPath.slice(0, -1)
    }
    return hostPath
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}
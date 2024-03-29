const { JSDOM } = require('jsdom')

async function crawlPage(baseURL, currentURL, pages){
    
    const baseURLObj = new URL (baseURL)
    const currentURLObj =new URL (currentURL)
    if(baseURLObj.hostname !== currentURLObj.hostname){
      return pages
    }

    const normalizeCurrentURL = normalizeURL(currentURL)
    if(pages[normalizeCurrentURL]> 0){
      pages[normalizeCurrentURL]++
      return pages
    }

    pages[normalizeCurrentURL] = 1

    console.log(`actively crawling: ${currentURL}`)


    try{
        const resp = await fetch(currentURL)

        if(resp.status > 399){
            console.log(`error in fetch with status code: ${resp.status} on page: ${currentURL}`)
            return pages
        }

        const contentType = resp.headers.get("content-type")
        if(!contentType.includes("text/html")){
          console.log(`non html response, content type: ${contentType}, on page: ${currentURL}`)
          return pages
        }

        const htmlbody = await resp.text()

        nextURLs = getURLsFromHTML(htmlbody, baseURL)

        for(const nextURL of nextURLs){
          pages = await crawlPage(baseURL, nextURL, pages)
        }
    } catch(err){
        console.log(`error in fetch: ${err.message}, on page: ${currentURL}`)
    }
    return pages
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
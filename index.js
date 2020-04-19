addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with a randomly selected variant URL.
 * @param {Request} request
 */
async function handleRequest(request) {
  const COOKIE_NAME = "variant"

  // Fetch the URLs.
  const url = "https://cfw-takehome.developers.workers.dev/api/variants"
  const headers = { 'User-Agent': 'cfw-takehome-worker-bot' }
  const result = await fetch(url, { headers })
  const issue = await result.json()

  let which_variant

  // Fetch the stored variant ID if stored.
  const cookie = request.headers.get('cookie')
  if (cookie && cookie.includes(`${COOKIE_NAME}=0`)) {
    which_variant = 0
  }
  else if (cookie && cookie.includes(`${COOKIE_NAME}=1`)) {
    which_variant = 1
  }
  else {
    // Otherwise, randomly pick a variant.
    which_variant = Math.floor(Math.random() * issue.variants.length)
  }

  // Fetch, and modify.
  const variant = await fetch(issue.variants[which_variant], { headers })
  const variant_result = await new HTMLRewriter().on('*', new TextReplacement()).transform(variant).text()

  return new Response(variant_result,
    {
      // Store the cookie and the right content type.
      headers: {
        'content-type': 'text/html',
        'Set-Cookie': `${COOKIE_NAME}=${which_variant}`
      }
    })
}

class TextReplacement {
  element(element) {
    // Format: tagName, ID Attribute, New Text
    const replacement = [
      ["title", null, "Tab Title"],
      ["h1", "title", "This is a title replacement!"],
      ["p", "description", "This is a description replacement."],
      ["a", "url", "Go back to Vaibhavs Site"]
    ]

    // Checks if a match has been hit.
    const value = replacement.filter(function (el) { return (el[0] === element.tagName && el[1] === element.getAttribute("id")) })

    if (value.length === 1) {
      // Replace the text.
      element.setInnerContent(value[0][2])
    }

    // Replace the link.
    if (element.tagName === "a" && element.getAttribute("id")) {
      element.setAttribute("href", "https://in.linkedin.com/in/vaibhav-aren-9411b3178")
    }
  }
}
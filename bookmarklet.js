// javascript:(()=>{const s=document.createElement('script');s.src='http://192.168.0.20:9000/bookmarklet.js';document.head.appendChild(s)})()
{
  const iframe = document.createElement('iframe')
  const href = new URL('./live-index.html', document.currentScript.src)
  iframe.src = href.href;
  // iframe.src = 'https://example.com';

  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.zIndex = '9999';
  iframe.style.border = 'none';

  iframe.onload = () => {
    console.log('iframe loaded, setting up message channel')
    const mc = new MessageChannel();
    mc.port2.onmessage = evt => {
        const port = evt.ports[0];
        fetch(...evt.data).then(res => {
            const obj = {
                body: res.body,
                bodyUsed: false,
                headers: [...res.headers],
                ok: res.ok,
                redirected: res.redirected,
                status: res.status,
                statusText: res.statusText,
                type: res.type,
                url: res.url
            };
            port.postMessage(obj, [res.body])
        })
    };
    iframe.contentWindow.postMessage('', '*', [mc.port1])
  }

  document.body.appendChild(iframe);
}
(function () {
  const STORAGE_KEY = 'rekyl-dialog-layout-css'

  function openRekylDialog({ orderId, projectId, int_project1, int_project2 }) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const topHeight = saved.topHeight || '35%'
    const orderWidth = saved.orderWidth || '66%'

    const dialog = document.createElement('dialog')
    dialog.innerHTML = `
      <style>
        dialog.rekyl-modal { width:95vw;height:95vh;border:none;border-radius:12px;overflow:hidden }
        dialog::backdrop { background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);}
        .rekyl-wrapper {display:flex;flex-direction:column;height:100%;font-family:sans-serif;background:#f5f5f5}
        .rekyl-header {display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:#222;color:#fff}
        .rekyl-close {background:#ff5c5c;border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer}
        .rekyl-content {display:flex;flex-direction:column;height:100%;overflow:hidden}
        .row.top {display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:16px;overflow:auto;resize:vertical;min-height:100px;max-height:70%;height:${topHeight}}
        .row.bottom {display:grid;grid-template-columns:${orderWidth} 6px auto;gap:16px;flex:1;min-height:0}
        .rekyl-section {display:flex;flex-direction:column;overflow:hidden;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
        .rekyl-section h3 {margin:0;padding:10px 12px;background:#eee;flex-shrink:0}
        .rekyl-section iframe {flex:1;border:none;width:100%;height:100%}
        .row.top iframe {min-height:220px}
        .col-resize {width:6px;cursor:col-resize;background:rgba(0,0,0,0.05)}
        .col-resize:hover {background: rgba(0,0,0,0.1)}
      </style>

      <div class="rekyl-wrapper">
        <div class="rekyl-header">
          <div>Workorder ${orderId}</div>
          <button class="rekyl-close">Stäng</button>
        </div>

        <div class="rekyl-content">
          <div class="row top" id="topRow">
            <div class="rekyl-section">
              <h3>Kommentarer</h3>
              <iframe src="https://app.rekyl.nu/8399/comment.asp?int_type=8&int_reference=${orderId}&int_tab=361"></iframe>
            </div>
            <div class="rekyl-section">
              <h3>Resurser</h3>
              <iframe src="https://app.rekyl.nu/8399/scheme.asp?show=schemelist&resourcetype=7&resource=${orderId}&tab=267"></iframe>
            </div>
            <div class="rekyl-section">
              <h3>Leverantörsfakturor</h3>
              <iframe src="https://app.rekyl.nu/8399/preinvoice.asp?show=summarysupplierinvoice&fromproject=1&str_project=${projectId}&int_project0=${projectId}&int_project1=${int_project1}&int_project2=${int_project2}&int_company=2&workorder_id=${orderId}&int_debitmethod=0&int_tab=307"></iframe>
            </div>
          </div>

          <div class="row bottom" id="bottomRow">
            <div class="rekyl-section" id="orderSection">
              <h3>Order</h3>
              <iframe src="https://app.rekyl.nu/v5/8399/page/workorderlist/details/workorder/${orderId}></iframe>
            </div>

            <div class="col-resize" id="colResizer"></div>

            <div class="rekyl-section" id="summarySection">
              <h3>Slutsummering</h3>
              <iframe src="https://app.rekyl.nu/8399/preinvoice.asp?show=summaryfinal&fromproject=1&calculusmode=0&str_project=${projectId}&int_project0=26&int_project1=${int_project1}&int_project2=${int_project2}&int_company=2&workorder_id=${orderId}&int_price=0&int_debitmethod=0&datefrom=&dateto=&int_tab=4449"></iframe>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(dialog)
    dialog.classList.add('rekyl-modal')
    dialog.querySelector('.rekyl-close').onclick = () => dialog.close()
    dialog.showModal()
    dialog.addEventListener('close', () => dialog.remove())

    // Column resize (JS)
    const colResizer = dialog.querySelector('#colResizer')
    const bottomRow = dialog.querySelector('#bottomRow')
    let isCol = false
    colResizer.onmousedown = () => { isCol=true; document.body.style.cursor='col-resize' }
    window.onmousemove = e => {
      if(!isCol) return
      const rect = bottomRow.getBoundingClientRect()
      const percent = Math.max(20, Math.min(80, (e.clientX - rect.left)/rect.width*100))
      bottomRow.style.gridTemplateColumns = percent + '% 6px ' + (100-percent) + '%'
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        topHeight: dialog.querySelector('#topRow').style.height,
        orderWidth: percent+'%'
      }))
    }
    window.onmouseup = () => { isCol=false; document.body.style.cursor='' }

    const topRow = dialog.querySelector('#topRow')
    const resizeObserver = new ResizeObserver(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        topHeight: topRow.style.height,
        orderWidth: bottomRow.style.gridTemplateColumns.split(' ')[0]
      }))
    })
    resizeObserver.observe(topRow)
  }

  // Lyssna på ctrl/cmd + vänsterklick eller mittenmus
  document.querySelectorAll('table tr').forEach(tr => {
    tr.addEventListener('mousedown', e => {
      const isCtrlClick = (e.button === 0 && (e.ctrlKey || e.metaKey))
      const isMiddleClick = e.button === 1

      if (!isCtrlClick && !isMiddleClick) return

      e.preventDefault()

      const orderId = tr.querySelector('[data-label="Order"]')?.innerText.trim()
      const projectId = tr.querySelector('[data-label="Projekt"]')?.innerText.trim()
      if (!orderId || !projectId) return
      const int_project1 = projectId.slice(0,3)
      const int_project2 = projectId.slice(3)

      openRekylDialog({ orderId, projectId, int_project1, int_project2 })
    })
  })
})()

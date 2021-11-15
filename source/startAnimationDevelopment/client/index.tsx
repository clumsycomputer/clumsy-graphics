import React from 'react'
import ReactDom from 'react-dom'

const appContainer = document.createElement('div')
document.body.append(appContainer)
ReactDom.render(<div>hello</div>, appContainer)

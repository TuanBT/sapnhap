import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faGlobe,
    faMapMarkerAlt,
    faArrowRight,
    faInfo,
    faSearch,
    faSpinner
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(faGlobe, faMapMarkerAlt, faArrowRight, faInfo, faSearch, faSpinner)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
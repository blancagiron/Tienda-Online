import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import ProductDetail from './ProductDetails'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  )
}

export default App
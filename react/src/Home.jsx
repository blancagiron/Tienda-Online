import useSWR from 'swr'
import { Link } from 'react-router-dom'

const fetcher = (url) => fetch(url).then((res) => res.json())

function Home() {
  const { data, error } = useSWR('https://fakestoreapi.com/products', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Escaparate</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((product) => (
          <div key={product.id} className="card">
            <figure className="h-48">
              <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.title}</h2>
              <p className="truncate">{product.description}</p>
              <div className="card-actions justify-end">
                <Link to={`/product/${product.id}`} className="btn btn-primary">Comprar ahora</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
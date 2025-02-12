import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error } = useSWR(`https://fakestoreapi.com/products/${id}`, fetcher)

  if (error) return <div className="text-center text-red-500">Failed to load</div>
  if (!data) return <div className="text-center text-gray-500">Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="card">
        <h1 className="card-title text-4xl mb-4">{data.title}</h1>
        <div className="flex flex-col md:flex-row">
          <figure className="md:w-1/2">
            <img src={data.image} alt={data.title} />
          </figure>
          <div className="card-body md:w-1/2 md:ml-6">
            <p className="mb-4">{data.description}</p>
            <p className="text-2xl font-bold mb-4" style={{ color: 'var(--color-button-hover-bg)' }}>
              ${data.price}
            </p>
            <button
              className="px-4 py-2"
              onClick={() => navigate('/')}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

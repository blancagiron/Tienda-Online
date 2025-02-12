
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando fetch de ratings...');
    const ele_stars = document.getElementsByClassName('stars');

    for (const ele of ele_stars) {
        const productId = ele.dataset._id;

        // Fetch inicial para cargar las calificaciones
        fetch(`/tienda/api/ratings/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(productoData => {
                const rating = productoData.rating?.rate || 0;
                const count = productoData.rating?.count || 0;

                ele.innerHTML = generateStarRatingHTML(rating, count);
                attachStarClickHandlers(ele, productId);
            })
            .catch(error => {
                console.error('Error fetching rating:', error);
                ele.innerHTML = 'No se pudo cargar la calificación';
            });
    }

    function generateStarRatingHTML(rating, count) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        let html = '';

        // Mostrar el rating como número
        html += `<div class="rating-number">Rating: ${rating.toFixed(1)}</div>`;

        // Full stars
        for (let i = 1; i <= fullStars; i++) {
            html += `<span class="star full" data-star="${i}">★</span>`;
        }

        // Half star
        if (halfStar) {
            html += `<span class="star half" data-star="${fullStars + 1}">½</span>`;
        }

        // Empty stars
        for (let i = fullStars + halfStar + 1; i <= 5; i++) {
            html += `<span class="star empty" data-star="${i}">☆</span>`;
        }

        // Agregar el conteo de votos
        html += ` <span class="rating-count">(${count} opiniones)</span>`;

        return html;
    }

    function attachStarClickHandlers(ele, productId) {
        const stars = ele.querySelectorAll('.star');
        for (const star of stars) {
            star.addEventListener('click', (evt) => vote(evt, ele, productId));
        }
    }

    function vote(evt, ele, productId) {
        const selectedStar = parseInt(evt.target.dataset.star, 10);

        // Enviar calificación al servidor
        fetch(`/tienda/api/ratings/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rate: selectedStar,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al enviar la calificación');
                }
                return response.json();
            })
            .then(data => {
                const newRating = data.producto.rating.rate;
                const newCount = data.producto.rating.count;

                // Actualizar estrellas, rating y conteo basado en la respuesta
                ele.innerHTML = generateStarRatingHTML(newRating, newCount);
                attachStarClickHandlers(ele, productId); // Reasignar eventos
            })
            .catch(error => {
                console.error('Error al actualizar la calificación:', error);
                alert('No se pudo enviar la calificación. Intenta de nuevo.');
            });
    }
});

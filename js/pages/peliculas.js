const SWAPI_BASE_URL = "https://swapi.online/api/films";

const episodeMap = {
    "1": "The Phantom Menace",
    "2": "Attack of the Clones",
    "3": "Revenge of the Sith",
    "4": "A New Hope",
    "5": "The Empire Strikes Back",
    "6": "Return of the Jedi",
    "7": "The Force Awakens",
    "8": "The Last Jedi",
    "9": "The Rise of Skywalker",
    "solo": "Solo",
    "rogue-one": "Rogue One"
};

const translationMap = {
    "title": "Título",
    "director": "Director",
    "producer": "Productor",
    "producers": "Productores",
    "release_date": "Año de lanzamiento",
    "opening_crawl": "Descripción de apertura",
    "characters": "Personajes",
    "planets": "Planetas",
    "vehicles": "Vehículos",
    "starships": "Naves espaciales",
    "species": "Especies"
};

function translateMovieData(data) {
    const translated = { ...data };
    
    const titleTranslations = {
        "The Phantom Menace": "La amenaza fantasma",
        "Attack of the Clones": "El ataque de los clones",
        "Revenge of the Sith": "La venganza de los Sith",
        "A New Hope": "Una nueva esperanza",
        "The Empire Strikes Back": "El Imperio contraataca",
        "Return of the Jedi": "El retorno del Jedi",
        "The Force Awakens": "El despertar de la Fuerza",
        "The Last Jedi": "Los últimos Jedi",
        "The Rise of Skywalker": "El ascenso de Skywalker"
    };
    
    if (translated.title && titleTranslations[translated.title]) {
        translated.title = titleTranslations[translated.title];
    }
    
    return translated;
}

function createModal() {
    const modal = document.createElement("div");
    modal.id = "info-modal";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body" id="modal-body">
                <p class="loading">Cargando información...</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function getModal() {
    let modal = document.getElementById("info-modal");
    if (!modal) {
        modal = createModal();
    }
    return modal;
}

function showModal() {
    const modal = getModal();
    modal.style.display = "flex";
}

function closeModal() {
    const modal = getModal();
    modal.style.display = "none";
}
async function fetchMovieInfo(movieTitle) {
    try {
        const response = await fetch(SWAPI_BASE_URL);
        if (!response.ok) {
            throw new Error("No se pudo conectar con SWAPI");
        }
        const data = await response.json();
 
        const movie = data.find(film => 
            film.title && film.title.toLowerCase().includes(movieTitle.toLowerCase())
        );
        
        if (!movie) {
            return null;
        }
        
        return movie;
    } catch (error) {
        console.error("Error al obtener información de SWAPI:", error);
        throw error;
    }
}

async function displayMovieInfo(episode, movieTitle) {
    showModal();
    const modalBody = document.getElementById("modal-body");
    
    if (!movieTitle) {
        modalBody.innerHTML = `
            <h2>Información no disponible</h2>
            <p>Esta película no está disponible en la base de datos de Star Wars API.</p>
        `;
        return;
    }

    try {
        let movieData = await fetchMovieInfo(movieTitle);
        if (!movieData) {
            modalBody.innerHTML = `
                <h2>Información no disponible</h2>
                <p>Esta película no está disponible en la base de datos de Star Wars API.</p>
            `;
            return;
        }
        movieData = translateMovieData(movieData);
        const releaseDate = movieData.release_date || "No disponible";
        const director = movieData.director || "No disponible";
        const producer = movieData.producer || movieData.producers || "No disponible";
        const openingCrawl = movieData.opening_crawl || "No disponible";
        let charactersHTML = "";
        if (movieData.characters && movieData.characters.length > 0) {
            const characterNames = movieData.characters.slice(0, 10);
            charactersHTML = `
                <div class="characters-section">
                    <h3>Personajes principales:</h3>
                    <ul>
                        ${characterNames.map(char => {
                            const charName = typeof char === "string" ? 
                                char.split("/").filter(p => p).pop() : 
                                (char.name || "Desconocido");
                            return `<li>${charName}</li>`;
                        }).join("")}
                    </ul>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <h2>${movieData.title || "Película desconocida"}</h2>
            <div class="movie-details">
                <p><strong>Año de lanzamiento:</strong> ${releaseDate}</p>
                <p><strong>Director:</strong> ${director}</p>
                <p><strong>Productor:</strong> ${producer}</p>
                <p><strong>Descripción de apertura:</strong></p>
                <p class="opening-crawl">"${openingCrawl}"</p>
                ${charactersHTML}
            </div>
        `;
    } catch (error) {
        modalBody.innerHTML = `
            <h2>Error</h2>
            <p>No se pudo cargar la información: ${error.message}</p>
        `;
    }
}

function initMoviePage() {
    const buttons = document.querySelectorAll(".btn-info-api");
    
    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const episode = button.getAttribute("data-episode");
            const movieTitle = episodeMap[episode];
            await displayMovieInfo(episode, movieTitle);
        });
    });

    const modal = getModal();
    const closeBtn = modal.querySelector(".modal-close");
    
    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMoviePage);
} else {
    initMoviePage();
} 

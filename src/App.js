import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import useMovies from "./useMovies";
import useLocalStorageState from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API_KEY = "apikey=317db813";
const BASE_URL = `http://www.omdbapi.com/?${API_KEY}`;
const ITEMS_PER_PAGE = 10;

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);


  const { movies, isLoading, error, isFetchComplete, totalPages } = useMovies(query, currentPage);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function goToNextPage() {
    setCurrentPage((prevPage) => prevPage + 1);
  }

  function goToPreviousPage() {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }

  function handleSelectMovie(id) {
    setSelectedId(selectedId => id === selectedId ? null : id)
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} setCurrentPage={setCurrentPage} />
        <Numresults movies={movies} />
      </Navbar>
      <Main>
        <Box >
          {
            isLoading &&
            <Loader />
          }
          {!isLoading &&
            !error &&
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />
          }
          {
            error &&
            <ErrorMessage
              message={error}
            />
          }
        </Box>
        <Box >
          {
            selectedId ?
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched={watched}
              />
              :
              <>
                <WatchedSummary watched={watched} />
                <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
              </>
          }
        </Box>
      </Main>
      <Pages goToNextPage={goToNextPage} goToPreviousPage={goToPreviousPage} currentPage={currentPage} isFetchComplete={isFetchComplete} totalPages={totalPages} />
    </>
  );
}

function Pages({ goToNextPage, goToPreviousPage, currentPage, isFetchComplete, totalPages }) {
  const totalPageNumber = Math.ceil(totalPages / ITEMS_PER_PAGE);
  const isNextPageAvailable = isFetchComplete && currentPage < totalPageNumber;
  const isPreviousPageAvailable = isFetchComplete && currentPage > 1;
  return (
    <div className="pagination">
      <button
        onClick={goToPreviousPage}
        disabled={!isPreviousPageAvailable}
        className={`pagination-btn ${!isPreviousPageAvailable ? "disable" : ''}`}
      >
        Previous Page
      </button>
      <span className="pagination-current">Page {currentPage}</span>
      <button
        className={`pagination-btn ${!isNextPageAvailable ? "disable" : ''}`}
        onClick={goToNextPage}
        disabled={!isNextPageAvailable}
      >
        Next Page
      </button>
    </div >)
}




function Loader() {
  return <p className="loader">Loading...</p>
}

function ErrorMessage({ message }) {
  return <p className="error">
    {message}
  </p>
}

function Navbar({ children }) {
  return <nav className="nav-bar">
    <Logo />
    {children}
  </nav>
}

function Logo() {
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
}

function Numresults({ movies }) {
  return <p className="num-results">
    Found <strong>{movies.length} </strong>results
  </p>
}

function Search({ query, setQuery, setCurrentPage }) {

  const inputEl = useRef(null);

  useKey(function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery('');
    setCurrentPage(1)
  }, 'Enter')

  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
    ref={inputEl}
  />
}


function Main({ children }) {
  return <main className="main">
    {children}
  </main>
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return <div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>
    {isOpen && (children)}
  </div>
}


function MovieList({ movies, onSelectMovie }) {
  return <ul className="list list-movies">
    {movies?.map((movie) => (
      <MovieListItem movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
    ))}
  </ul>
}

function MovieListItem({ movie, onSelectMovie }) {
  return <li onClick={() => onSelectMovie(movie.imdbID)}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
}


function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0);

  useEffect(function () {
    if (userRating)
      countRef.current = countRef.current + 1;
  }, [userRating])


  const isWatched = watched?.map(movie => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched?.find(movie => movie.imdbID === selectedId)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecision: countRef.current
    }
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey(onCloseMovie, 'Escape');


  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId])

  useEffect(function () {
    if (!title) return;
    document.title = `Movie: ${title}`;

    return function () {
      document.title = 'usePopcorn'
    }
  }, [title]);

  return <div className="details">
    {isLoading ? <Loader /> :
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>⬅</button>
          <img src={poster} alt={`Poster of ${title}`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>
              {released} &bull; {runtime}
            </p>
            <p>{genre}</p>
            <p>
              <span>⭐</span>
              {imdbRating} IMDb rating
            </p>
          </div>
        </header>
        <section>
          <div className="rating">
            {!isWatched ?
              <>
                < StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                />
                {userRating > 0 &&
                  <button
                    className="btn-add"
                    onClick={handleAdd}>
                    + Add to watchlist
                  </button>
                }</> : <p>You rated this movie {watchedUserRating} ⭐</p>}

          </div>
          <p>
            <em>{plot}</em>
          </p>
          <p>Starring: {actors}</p>
          <p> Directed by {director}</p>
        </section>
      </>
    }
  </div>
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
    ))}
  </ul>
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return <li >
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{movie.userRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>
      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
    </div>
  </li>
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return <div className="summary">
    <h2>Movies you watched</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{avgUserRating.toFixed(2)}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime} min</span>
      </p>
    </div>
  </div>
}
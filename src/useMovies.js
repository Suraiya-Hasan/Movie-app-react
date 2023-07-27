import { useState, useEffect } from "react";
const API_KEY = "apikey=317db813";
const BASE_URL = `http://www.omdbapi.com/?${API_KEY}`;

export default function useMovies(query, page) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFetchComplete, setIsFetchComplete] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    useEffect(
        function () {
            // callback?.();
            const controller = new AbortController();

            async function fetchMovies() {
                try {
                    setIsLoading(true);
                    setError('');
                    const response = await fetch(`${BASE_URL}&s=${query}&page=${page}`, { signal: controller.signal });

                    if (!response.ok)
                        throw new Error("Something went wrong with fetching movies.");

                    const data = await response.json();

                    if (data.Response === "False")
                        throw new Error("Movie not found");
                    setMovies(data.Search);
                    console.log(data)
                    setTotalPages(Number(data.totalResults));
                    console.log(totalPages)
                    setIsFetchComplete(true);

                } catch (err) {

                    if (err.name !== "AbortError")
                        setError(err.message);
                    setIsFetchComplete(true);
                } finally {
                    setIsLoading(false);
                }
            }


            if (query.length < 2) {
                setMovies([]);
                setError('');
                return;
            }

            fetchMovies();

            return function () {
                controller.abort();
            }
        }, [query, page, totalPages]);
    return { movies, error, isLoading, isFetchComplete, totalPages }
}
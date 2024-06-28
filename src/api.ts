const API_KEY = "fbd49aa9d34009a5e0c065c0174f2a70";
const BASE_PATH = "https://api.themoviedb.org/3";

// https://image.tmdb.org/t/p/w500//fqv8v6AycXKsivp1T5yKtLbGXce.jpg

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

export interface IGetMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: IMovie[];
  total_pages: number;
  total_results: number;
}

interface ITvshow {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

export interface IGetTvshowsResult {
  page: number;
  results: ITvshow[];
  total_pages: number;
  total_results: number;
}

export function getMovies() {
  return fetch(
    `${BASE_PATH}/movie/now_playing?language=ko-KR&api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getUpcomingMv() {
  return fetch(
    `${BASE_PATH}/movie/upcoming?language=ko-KR&api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getTopMv() {
  return fetch(
    `${BASE_PATH}/movie/top_rated?language=ko-KR&api_key=${API_KEY}`
  ).then((response) => response.json());
}

export function getTvshows() {
  return fetch(
    `${BASE_PATH}/tv/top_rated?language=ko-KR&api_key=${API_KEY}`
  ).then((response) => response.json());
}

import React, { useState, useEffect } from 'react';
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import axios from 'axios';
import './App.css';

const App = () => {
  const [movieTitle, setMovieTitle] = useState('');
  const [imageLink, setImageLink] = useState(''); // Added imageLink state
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [movies, setMovies] = useState([]);

  const addMovie = async () => {
    try {
      const response = await axios.post(`/movie`, {
        movieId: Date.now().toString(),
        imageLink: imageLink.trim(), // Ensure trimmed input
        title: movieTitle.trim(),
        rating: parseFloat(rating),
        review: review.trim(),
      });
      Store.addNotification({
        message: response.data.message,
        type: "default",
        insert: "top",
        container: "top-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
        }
      });
      setMovieTitle(''); 
      setImageLink('');
      setRating('');
      setReview('');
      getMovies();
    } catch (error) {
      console.error('Error adding movie:', error.response || error);
      Store.addNotification({
        message: "Failed to add movie.",
        type: "danger",
        insert: "top",
        container: "top-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
        }
      });
    }
  };

  const getMovies = async () => {

    try {
      const response = await axios.get(`/movies`);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error.response || error);
      Store.addNotification({
        message: "Failed to fetch movies.",
        type: "danger",
        insert: "top",
        container: "top-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
        }
      });
    }
  };

  useEffect(() => {
    getMovies();
  }, []);

  return (

    <div className="app-container">
      <div className="notifications">
        <ReactNotifications />
      </div>
      <h1 className="app-title">MyMovies</h1>

      <section className="movie-form">
        <h2>Add a Movie</h2>
        <input 
          type="text" 
          placeholder="Movie Title" 
          value={movieTitle} 
          onChange={(e) => setMovieTitle(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Image URL" 
          value={imageLink} 
          onChange={(e) => setImageLink(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Rating (1-5)" 
          value={rating} 
          min="1"
          max="5"
          onChange={(e) => setRating(e.target.value)} 
        />
        <textarea 
          className="review"
          placeholder="Write a review" 
          value={review} 
          onChange={(e) => setReview(e.target.value)} 
        />
        <button onClick={addMovie}>Add Movie</button>
      </section>

      <section className="movie-list">
        <h2>Ranked Movies</h2>
        <div className="movies-container">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.movieId} className="movie-item">
                <img 
                  src={movie.imageLink || "https://via.placeholder.com/150x225?text=No+Image"}
                  alt={`${movie.title} poster`} 
                  className="movie-poster"
                />
                <div className="movie-info">
                  <p className="movie-title">{movie.title || "No Title Provided"}</p>
                  <span className="movie-rating">{movie.rating}/5</span>
                  <p><strong>Review:</strong> {movie.review || "No review added."}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No movies available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;

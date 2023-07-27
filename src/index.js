import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import StarRating from './StarRating';
import './index.css';
import App from './App';

function Test() {
  const [movieR, setMovieR] = useState(0);
  return (
    <div>
      <StarRating color='blue' maxRating={10} onSetRating={setMovieR} />
      <p>THis movie was rated {movieR}</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating messages={['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']} />
    <StarRating size={48} color='#fcc' className='test' />
    <StarRating defaultRating={3} />
    <StarRating maxRating={20} color='black' />
    <Test /> */}
  </React.StrictMode >
);

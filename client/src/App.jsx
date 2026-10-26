import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clapperboard, Clock3, Film, Heart, MapPin, Menu, Play, Search, ShieldCheck, Sparkles, Star, Ticket, X, UserRound, LogIn, Eye, EyeOff } from 'lucide-react';
import { demoMovies, demoShows } from './data.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const genres = ['All films', 'Action', 'Adventure', 'Animation', 'Drama', 'Romance', 'Sci-Fi'];

function Poster({ movie, className='' }) {
  const [failed, setFailed] = useState(false);
  return <div className={`poster ${className}`}>
    {!failed && movie.poster ? <img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" onError={() => setFailed(true)} /> : <div className="poster-fallback"><Film size={30}/><span>{movie.title}</span></div>}
  </div>;
}

function BookingModal({ movie, onClose, onBooked }) {
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [shows, setShows] = useState(demoShows);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API}/shows?movieId=${encodeURIComponent(movie._id)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { if (active && Array.isArray(data) && data.length) { setShows(data); setLive(true); } })
      .catch(() => {});
    return () => { active = false; };
  }, [movie._id]);

  const toggleSeat = seat => setSeats(old => old.includes(seat) ? old.filter(s => s !== seat) : old.length < 8 ? [...old, seat] : old);
  const price = Number(show?.price || movie.price || 200);
  const makeBooking = async () => {
    if (!name.trim() || !email.trim()) { setError('Please enter your name and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setBusy(true); setError('');
    try {
      if (!live) throw new Error('DEMO');
      const response = await fetch(`${API}/bookings`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ customerName:name.trim(), email:email.trim(), movieId:movie._id, showId:show._id, seats, totalAmount:price*seats.length })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not complete booking.');
      setConfirmation(data);
    } catch (e) {
      if (e.message === 'DEMO' || e instanceof TypeError) setError('Demo preview: the backend is not connected, so no real booking was saved. Start the server and connect MongoDB to enable bookings.');
      else setError(e.message || 'Could not complete booking.');
    } finally { setBusy(false); }
  };

  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="booking-modal" role="dialog" aria-modal="true" aria-label={`Book ${movie.title}`}>
      <button className="icon-btn modal-close" onClick={onClose} aria-label="Close"><X/></button>
      {confirmation ? <div className="success-state">
        <div className="success-icon"><Check size={34}/></div><span className="eyebrow">YOU'RE ALL SET</span>
        <h2>Movie night, <em>secured.</em></h2><p>Your booking has been saved successfully.</p>
        <div className="ticket-receipt"><Poster movie={movie}/><div><strong>{movie.title}</strong><span>{show?.time}</span><span>Seats {seats.join(', ')}</span><b>{money(price*seats.length)}</b><small>Booking ID: {confirmation.bookingId || confirmation._id}</small></div></div>
        <button className="primary-btn full" onClick={() => { onBooked(); onClose(); }}>Done <ArrowRight size={17}/></button>
      </div> : <>
        <div className="modal-top"><span className="eyebrow">YOUR NEXT MOVIE NIGHT</span><h2>{movie.title}</h2><p><Clock3 size={14}/> {movie.duration} min <span>·</span> {movie.language} <span>·</span> {movie.genre}</p>
          <div className="step-track"><span className={step>=1?'active':''}>01 <small>Showtime</small></span><i/><span className={step>=2?'active':''}>02 <small>Seats</small></span><i/><span className={step>=3?'active':''}>03 <small>Details</small></span></div>
        </div>
        {step===1 && <div className="modal-content"><div className="section-label"><CalendarDays size={16}/> TODAY'S SHOWTIMES <span>Choose a show</span></div>
          <div className="show-list">{shows.map(s => <button key={s._id} className={`show-option ${show?._id===s._id?'selected':''}`} onClick={() => setShow(s)}><strong>{s.time}</strong><span>{s.theatre || 'iMovies Cinema'}</span><small>{s.format || '2D'} · {money(s.price || movie.price)}</small></button>)}</div>
          <button className="primary-btn full" disabled={!show} onClick={() => setStep(2)}>Choose seats <ArrowRight size={17}/></button>
        </div>}
        {step===2 && <div className="modal-content">
          <div className="screen-label"><div className="screen-curve"/>SCREEN THIS WAY</div>
          <div className="seat-grid">{Array.from({length:6},(_,r)=><div className="seat-row" key={r}><small>{String.fromCharCode(65+r)}</small>{Array.from({length:8},(_,c)=>{const seat=`${String.fromCharCode(65+r)}${c+1}`;const demoOccupied=['A3','A4','B6','C2','D7','E4','F1'].includes(seat);const occupied=(show?.bookedSeats||[]).includes(seat)||(live?false:demoOccupied);return <button key={seat} disabled={occupied} aria-label={`Seat ${seat}${occupied?', occupied':''}`} title={occupied?'Occupied':seat} className={`seat ${occupied?'occupied':''} ${seats.includes(seat)?'chosen':''}`} onClick={()=>toggleSeat(seat)}>{c+1}</button>})}</div>)}</div>
          <div className="seat-legend"><span><i/> Available</span><span><i className="chosen"/> Selected</span><span><i className="occupied"/> Occupied</span></div>
          <div className="seat-summary"><div><small>SELECTED SEATS</small><strong>{seats.length?seats.join(', '):'None yet'}</strong></div><div><small>TOTAL</small><strong>{money(price*seats.length)}</strong></div></div>
          <div className="modal-actions"><button className="secondary-btn" onClick={()=>setStep(1)}><ArrowLeft size={16}/> Back</button><button className="primary-btn" disabled={!seats.length} onClick={()=>setStep(3)}>Continue <ArrowRight size={17}/></button></div>
        </div>}
        {step===3 && <div className="modal-content"><div className="checkout-summary"><span>{movie.title} · {show?.time}</span><span>{seats.join(', ')} ({seats.length} {seats.length===1?'seat':'seats'})</span><strong>Total <b>{money(price*seats.length)}</b></strong></div>
          <label className="field-label">YOUR NAME<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"/></label>
          <label className="field-label">EMAIL ADDRESS<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
          {error && <p className="error-msg">{error}</p>}
          <p className="demo-note"><ShieldCheck size={15}/> No payment is collected in this demo.</p>
          <div className="modal-actions"><button className="secondary-btn" onClick={()=>setStep(2)}><ArrowLeft size={16}/> Back</button><button className="primary-btn" disabled={busy} onClick={makeBooking}>{busy?'Booking…':'Confirm booking'} <Ticket size={17}/></button></div>
        </div>}
      </>}
    </section>
  </div>;
}

function App() {
  const [movies, setMovies] = useState(demoMovies);
  const [genre, setGenre] = useState('All films');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
const [registerName, setRegisterName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('imoviesUser') || 'null');
  } catch {
    return null;
  }
});
const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch(`${API}/movies`).then(r=>{if(!r.ok)throw new Error();return r.json();})
      .then(data=>{if(Array.isArray(data)&&data.length){setMovies(data);setApiOnline(true);}})
      .catch(()=>setApiOnline(false));
  }, []);
  
  const filtered = useMemo(() => movies.filter(m => (genre==='All films'||m.genre===genre) && `${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(search.toLowerCase())), [movies,genre,search]);
  const featured = movies.find(m=>m.featured) || movies[0];
  const notify = text => { setToast(text); window.setTimeout(()=>setToast(''),2600); };
  const toggleSaved = id => {setSaved(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);notify(saved.includes(id)?'Removed from your watchlist':'Added to your watchlist');};
  

const handleLogin = async (e) => {
  e.preventDefault();
  setLoginBusy(true);
  setLoginError('');

  try {
    const isRegister = authMode === 'register';

    const response = await fetch(
      `${API}/auth/${isRegister ? 'register' : 'login'}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegister
            ? {
                name: registerName.trim(),
                email: loginEmail.trim(),
                password: loginPassword,
              }
            : {
                email: loginEmail.trim(),
                password: loginPassword,
              }
        ),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed.');
    }

    localStorage.setItem('imoviesToken', data.token);
    localStorage.setItem('imoviesUser', JSON.stringify(data.user));

    setCurrentUser(data.user);
    setLoginOpen(false);
    setLoginPassword('');
    setLoginEmail('');
    setRegisterName('');
    setAuthMode('login');

    notify(
      isRegister
        ? `Welcome to iMovies, ${data.user.name}!`
        : `Welcome back, ${data.user.name}!`
    );
  } catch (error) {
    setLoginError(
      error instanceof TypeError
        ? 'Cannot connect to the server. Please try again.'
        : error.message
    );
  } finally {
    setLoginBusy(false);
  }
};


const handleLogout = () => {
  localStorage.removeItem('imoviesToken');
  localStorage.removeItem('imoviesUser');
  setCurrentUser(null);
  notify('You have logged out.');
};
  return <div className="app-shell">
    <header className="navbar">
      <a className="brand" href="#home" aria-label="iMovies home"><span className="brand-mark"><Clapperboard size={22}/></span><span>iMovies<span className="brand-dot">.</span></span></a>
      <nav className={menuOpen?'nav-links open':'nav-links'}><a className="nav-active" href="#home" onClick={()=>setMenuOpen(false)}>Discover</a><a href="#movies" onClick={()=>setMenuOpen(false)}>Movies</a><a href="#experience" onClick={()=>setMenuOpen(false)}>Experience</a></nav>
      <div className="nav-right"><span className="city-pill"><MapPin size={14}/> Indore <ChevronDown size={13}/></span><a href="#movies" className="nav-cta">Find a movie <ArrowDownRight size={16}/></a>
      {currentUser ? (
  <button className="login-nav-btn" onClick={handleLogout}>
    <UserRound size={16} />
    <span>{currentUser.name}</span>
    <span>· Logout</span>
  </button>
) : (
  <button
    className="login-nav-btn"
    onClick={() => {
      setLoginError('');
      setLoginOpen(true);
    }}
  >
    <LogIn size={16} />
    Login
  </button>
)}
      <button className="icon-btn mobile-menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><Menu/></button></div>
    </header>

    <main id="home">
      <section className="hero">
        <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        <div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> YOUR FRONT ROW STARTS HERE</div>
          <h1>Less scrolling.<br/>More <em>movie magic.</em></h1>
          <p>Find the film. Pick your seats. Make a night of it. Your next favourite cinema experience is just a few clicks away.</p>
          <div className="hero-actions"><a className="primary-btn" href="#movies">Explore movies <ArrowRight size={17}/></a><a className="text-link" href="#experience"><Play size={15} fill="currentColor"/> The iMovies experience</a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>✦</span><span>✺</span><span>✧</span></div><div><strong>Good films. Great plans.</strong><small>Your seat to something unforgettable.</small></div></div>
        </div>
        <div className="hero-art" aria-label="Featured movie posters">
          <div className="art-ring ring-one"/><div className="art-ring ring-two"/>
          <div className="floating-note"><Sparkles size={15}/><span>TONIGHT<br/><b>looks good.</b></span></div>
          <div className="poster-tilt poster-back"><Poster movie={movies[1]||demoMovies[1]}/></div>
          <div className="poster-tilt poster-front"><Poster movie={featured||demoMovies[0]}/><div className="poster-caption"><span>EDITOR'S PICK</span><strong>{featured?.title}</strong><small><Star size={13} fill="currentColor"/> {featured?.rating || '8.8'} <span>·</span> {featured?.year || 2024}</small></div></div>
          <div className="ticket-float"><Ticket size={18}/><span>YOUR NIGHT,<br/><b>your way.</b></span></div>
        </div>
        <div className="hero-bottom"><span>SCROLL TO DISCOVER</span><div className="scroll-line"/></div>
      </section>

      <section className="ticker-strip"><span>GOOD STORIES</span><i>✳</i><span>GREAT COMPANY</span><i>✳</i><span>BIG SCREEN ENERGY</span><i>✳</i><span>YOUR KIND OF NIGHT</span><i>✳</i><span>GOOD STORIES</span></section>

      <section className="movies-section" id="movies">
        <div className="section-heading"><div><span className="eyebrow">THE LINEUP</span><h2>Find your <em>next favourite.</em></h2><p>A little drama, a little wonder — what are you in the mood for?</p></div><div className="section-count"><strong>{filtered.length.toString().padStart(2,'0')}</strong><span>FILMS TO EXPLORE</span></div></div>
        <div className="discovery-tools"><div className="genre-tabs">{genres.map(g=><button key={g} className={genre===g?'active':''} onClick={()=>setGenre(g)}>{g}</button>)}</div><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search a movie, genre…"/>{search&&<button onClick={()=>setSearch('')} aria-label="Clear search"><X size={15}/></button>}</label></div>
        <div className="movie-grid">{filtered.map((m,i)=><article className="movie-card" key={m._id}><button className="poster-button" onClick={()=>setSelected(m)} aria-label={`Book ${m.title}`}><Poster movie={m}/><span className="poster-hover"><span><Ticket size={17}/> Book tickets</span></span>{i===0&&genre==='All films'&&!search&&<span className="card-tag">TRENDING NOW</span>}</button><button className={`heart-btn ${saved.includes(m._id)?'saved':''}`} onClick={()=>toggleSaved(m._id)} aria-label={saved.includes(m._id)?'Remove from watchlist':'Add to watchlist'}><Heart size={17} fill={saved.includes(m._id)?'currentColor':'none'}/></button><div className="movie-info"><div className="movie-meta"><span>{m.year||'Now showing'}</span><span className="rating"><Star size={12} fill="currentColor"/> {m.rating||'8.0'}</span></div><h3>{m.title}</h3><div className="movie-sub"><span>{m.genre}</span><i/> <span>{m.duration?`${m.duration} min`:m.language}</span></div><button className="book-link" onClick={()=>setSelected(m)}>Book tickets <ArrowRight size={15}/></button></div></article>)}</div>
        {!filtered.length&&<div className="empty-state"><Film size={32}/><h3>No films found</h3><p>Try another title or genre.</p><button className="secondary-btn" onClick={()=>{setGenre('All films');setSearch('');}}>Clear filters</button></div>}
        <div className="browse-footer"><span>YOUR NEXT STORY IS WAITING.</span><button className="text-link" onClick={()=>{setGenre('All films');setSearch('');}}>See all films <ArrowRight size={16}/></button></div>
      </section>

      <section className="experience-section" id="experience"><div className="experience-visual"><div className="experience-circle"><Clapperboard size={62} strokeWidth={1.2}/><span>MAKE IT<br/><b>A MOVIE NIGHT.</b></span></div><div className="exp-star star-a">✳</div><div className="exp-star star-b">✦</div><div className="exp-caption">GOOD PLANS, ON REPEAT.</div></div><div className="experience-copy"><span className="eyebrow">NOT JUST A TICKET</span><h2>Big-screen plans.<br/><em>Zero big hassle.</em></h2><p>Movie night should feel exciting from the very first click. We keep the little things simple, so you can focus on the story.</p><div className="benefit-list"><div><span className="benefit-icon"><Search size={18}/></span><div><strong>Find your kind of film</strong><small>Explore by title, genre, and mood.</small></div></div><div><span className="benefit-icon"><Ticket size={18}/></span><div><strong>Choose your perfect seat</strong><small>See your selection and total before confirming.</small></div></div><div><span className="benefit-icon"><Heart size={18}/></span><div><strong>Keep your favourites close</strong><small>Save the films you want to watch next.</small></div></div></div><a href="#movies" className="primary-btn">Make a plan <ArrowRight size={17}/></a></div></section>

      <section className="closing-banner"><div className="closing-spark">✳</div><span className="eyebrow">POPCORN IS CALLING</span><h2>Life's better on<br/>the <em>big screen.</em></h2><a href="#movies" className="primary-btn">Pick your movie <ArrowRight size={17}/></a><span className="closing-foot">YOUR STORY. YOUR SEAT. YOUR NIGHT.</span></section>
    </main>
    <footer className="footer"><a className="brand" href="#home"><span className="brand-mark"><Clapperboard size={19}/></span><span>iMovies<span className="brand-dot">.</span></span></a><span>Movie ticket booking, made a little more magical.</span><div><a href="#movies">Explore</a><a href="#experience">Our experience</a><a href="mailto:hello@imovies.example">Contact</a></div><small>© {new Date().getFullYear()} iMovies. Made for movie lovers.</small></footer>
    {selected&&<BookingModal movie={selected} onClose={()=>setSelected(null)} onBooked={()=>notify('Booking confirmed! Enjoy the show.')}/>}
      
{loginOpen && (
  <div
    className="modal-backdrop"
    onMouseDown={e => {
      if (e.target === e.currentTarget) setLoginOpen(false);
    }}
  >
    <section
      className="booking-modal login-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Login to iMovies"
    >
      <button
        className="icon-btn modal-close"
        onClick={() => setLoginOpen(false)}
        aria-label="Close login"
      >
        <X />
      </button>

      <div className="login-content">
        <div className="brand-mark login-brand">
          <Clapperboard size={25} />
        </div>

        <span className="eyebrow">WELCOME BACK</span>
        <h2>Ready for <em>movie night?</em></h2>
        <p>
  {authMode === 'login'
    ? 'Log in to continue to iMovies.'
    : 'Create an account to start your movie journey.'}
        </p>

        <form onSubmit={handleLogin}>
          

  {authMode === 'register' && (
    <label className="field-label">
      FULL NAME
      <input
        type="text"
        value={registerName}
        onChange={e => setRegisterName(e.target.value)}
        placeholder="Enter your full name"
        autoComplete="name"
        required
      />
    </label>
  )}

  

          <label className="field-label">
            EMAIL ADDRESS
            <input
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field-label">
            PASSWORD
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {loginError && (
            <p className="error-msg">{loginError}</p>
          )}

          <button
            type="submit"
            className="primary-btn full"
            disabled={loginBusy}
          >
            {loginBusy
  ? (authMode === 'register' ? 'Creating account…' : 'Logging in…')
  : (authMode === 'register' ? 'Create account' : 'Login')}
            {!loginBusy && <ArrowRight size={17} />}
          </button>
        </form>

<p className="login-footnote">
  {authMode === 'login'
    ? "Don't have an account?"
    : 'Already have an account?'}
  {' '}
  <button
    type="button"
    className="text-link"
    onClick={() => {
      setAuthMode(authMode === 'login' ? 'register' : 'login');
      setLoginError('');
    }}
  >
    {authMode === 'login' ? 'Create account' : 'Login'}
  </button>
</p>
       
      </div>
    </section>
  </div>
)}

    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
    <div className={`connection-status ${apiOnline?'online':''}`} title={apiOnline?'Backend connected':'Showing preview data'}><span/>{apiOnline?'LIVE DATA':'PREVIEW MODE'}</div>
  </div>;
}

export default App;

require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./src/models/Movie');
const Show = require('./src/models/Show');
 
const movies = [
  {title:'Dune: Part Two',genre:'Sci-Fi',language:'English',duration:166,rating:'8.8',year:2024,description:'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',poster:'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',backdrop:'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',price:240,featured:true},
  {title:'Spider-Man: Across the Spider-Verse',genre:'Animation',language:'English',duration:140,rating:'8.7',year:2023,description:'Miles Morales swings into a multiverse of Spider-People on a mission that will challenge everything he believes.',poster:'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj752uh.jpg',price:190},
  {title:'Oppenheimer',genre:'Drama',language:'English',duration:180,rating:'8.3',year:2023,description:'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.',poster:'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',price:220},
  {title:'Jawan',genre:'Action',language:'Hindi',duration:169,rating:'7.0',year:2023,description:'A high-octane action thriller about a man driven by a personal vendetta to correct the wrongs of society.',poster:'https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg',price:180},
  {title:'The Batman',genre:'Action',language:'English',duration:176,rating:'7.8',year:2022,description:'Batman ventures into Gotham City’s underworld when a sadistic killer leaves behind a trail of cryptic clues.',poster:'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',price:210},
  {title:'Everything Everywhere All at Once',genre:'Adventure',language:'English',duration:139,rating:'7.8',year:2022,description:'An exhausted laundromat owner is swept into an adventure through alternate universes only she can save.',poster:'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',price:200},
  {title:'La La Land',genre:'Romance',language:'English',duration:128,rating:'8.0',year:2016,description:'A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.',poster:'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',price:170},
  {title:'Interstellar',genre:'Sci-Fi',language:'English',duration:169,rating:'8.7',year:2014,description:'A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.',poster:'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6Mrunnt6Q.jpg',price:230},
  {title:'The Martian',genre:'Sci-Fi',language:'English',duration:144,rating:'8.0',year:2015,description:'An astronaut fights to survive after being stranded on Mars.',poster:'https://image.tmdb.org/t/p/w500/5aGhaIHYuQbqlHWvWYqMCnj40y2.jpg',price:200},
  {title:'Ford v Ferrari',genre:'Drama',language:'English',duration:152,rating:'8.1',year:2019,description:'A team builds a race car to challenge Ferrari at Le Mans.',poster:'https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg',price:210},
  {title:'Coco',genre:'Animation',language:'English',duration:105,rating:'8.4',year:2017,description:'A young musician discovers his family history in the Land of the Dead.',poster:'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',backdrop:'https://image.tmdb.org/t/p/w1280/askg3SMvhqEl4OL52YuvdtY40Yb.jpg',price:180},
  {title:'Arrival',genre:'Sci-Fi',language:'English',duration:116,rating:'7.9',year:2016,description:'A linguist tries to communicate with mysterious visitors.',poster:'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',backdrop:'https://image.tmdb.org/t/p/w1280/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg',price:190},
  {title:'The Grand Budapest Hotel',genre:'Drama',language:'English',duration:99,rating:'8.1',year:2014,description:'A hotel concierge and his protégé become involved in a mystery.',poster:'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',backdrop:'https://image.tmdb.org/t/p/w1280/nX5XotM9yprCKarRH4fzOq1VM1J.jpg',price:170},
  {title:'Your Name',genre:'Romance',language:'Japanese',duration:106,rating:'8.4',year:2016,description:'Two teenagers mysteriously begin switching bodies.',poster:'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',backdrop:'https://image.tmdb.org/t/p/w1280/8GJsy7w7frGquw1cy9jasOGNNI1.jpg',price:180},
  {title:'Inception',genre:'Sci-Fi',language:'English',duration:148,rating:'8.8',year:2010,description:'A thief enters dreams to plant an idea in a target’s mind.',poster:'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',backdrop:'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',price:220},
  {title:'Zindagi Na Milegi Dobara',genre:'Adventure',language:'Hindi',duration:155,rating:'8.2',year:2011,description:'Three friends take a life-changing road trip across Spain.',poster:'https://image.tmdb.org/t/p/w500/7wQJ2yQ2v9g0Y8XJ1x9f5QfQb3S.jpg',price:190}
];


async function run(){
 await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies');
 const inserted = [];

for (const movieData of movies) {
  const movie = await Movie.findOneAndUpdate(
    { title: movieData.title },
    { $set: movieData },
    { new: true, upsert: true, runValidators: true }
  );

  inserted.push(movie);
}
 const date = new Date().toISOString().slice(0,10);
 const shows = [];
 for(const movie of inserted){
   for(const [time,theatre,format,price] of [['10:30 AM','PVR Cinemas · Downtown','2D',movie.price],['1:45 PM','INOX · City Centre','IMAX',movie.price+40],['4:30 PM','Cinepolis · Riverside','2D',movie.price+20],['7:15 PM','PVR Cinemas · Downtown','Dolby Atmos',movie.price+60]]){
     shows.push({movie:movie._id,time,theatre,format,price,date,bookedSeats:[]});
   }
 }
 const existingShows = await Show.find({
  movie: { $in: inserted.map(movie => movie._id) },
  date
}).select('movie time theatre format');

const existingKeys = new Set(
  existingShows.map(show =>
    `${show.movie}|${show.time}|${show.theatre}|${show.format}`
  )
);

const newShows = shows.filter(show =>
  !existingKeys.has(
    `${show.movie}|${show.time}|${show.theatre}|${show.format}`
  )
);
 if (newShows.length > 0) {
  await Show.insertMany(newShows);
}
 console.log(`Processed ${inserted.length} movies and added ${newShows.length} new shows.`);
 await mongoose.disconnect();
}
run().catch(err=>{console.error(err);process.exit(1)});

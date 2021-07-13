# Anime-Data
Gives you every anime details, including anime schedule for a week.

## Usage  
```
npm install @dovakiin0/anime-data
```

**Basic Usage**
```js
const {AnimeData} = require("@dovakiin0/anime-data");

const anime = new AnimeData();
anime
  .searchAnime("oregairu")
  .then((res) => {
    // console.log(res)
    // list of anime that matches the search
    anime.getAnimeInfo(res[0].link).then((info) => {
      // console.log(info);
      // Anime details
      anime.getEpisode(info.slug, 1).then((episode) =>
        // gets the specific episode of the anime
        console.log(episode)
      );
    });
  })
  .catch((err) => console.log(err));
```

**Get Popular Anime**
```js
const anime = new AnimeData();
anime
  .getPopular() // you can pass page parameter, default page is 1
  .then((res) => {
    console.log(res);
  })
  .catch((err) => console.log(err));

```

**Get Recent Anime**
```js
const anime = new AnimeData();
anime
  .getRecent() // you can pass page parameter, default page is 1
  .then((res) => {
    console.log(res);
  })
  .catch((err) => console.log(err));
```

**Get Anime By Genre**
```js
/* Get all genre */
anime.getAllGenre()
  .then((genres)=>console.log(genres))
  .catch(err=>console.log(err))
/* [
  'Action',        'Adventure',    'Cars',
  'Comedy',        'Dementia',     'Demons',
  'Drama',         'Dub',          'Ecchi', ...]
  */
// Get anime by genre
anime.getAnimeGenre("Action") // you can pass page parameter, default page is 1
  .then((animes)=>console.log(animes))
  .catch((err)=>console.log(err))
// Returns a list of anime with 'Action" genre
```

**Anime Schedule**
```js
const {AnimeSchedule} = require("@dovakiin0/anime-data")
const schedule = new AnimeSchedule();
schedule
  .getSchedule() // (Optional) pass day to get specific day. e.g. "monday", "tuesday"
  .then((anime) => console.log(anime))
  .catch((err) => console.log(err));
/*
Format
saturday: [{
  title: 
  img: 
  episode: 
  airing_time: 
}],

*/
```

## Contributing
Fork the repo
```
git clone <forked-repo>
git checkout -b <new-feature>
git add <changed-file>
git commit -m "new feature"
git push origin <new-feature>
```
then submit a pull request

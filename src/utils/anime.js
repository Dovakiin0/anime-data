/**
 * MIT License
 *Copyright (c) 2021 Bishal Subedi
 *
 *Permission is hereby granted, free of charge, to any person obtaining a copy
 *of this software and associated documentation files (the "Software"), to deal
 *in the Software without restriction, including without limitation the rights
 *to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *copies of the Software, and to permit persons to whom the Software is
 *furnished to do so, subject to the following conditions:
 *
 *The above copyright notice and this permission notice shall be included in all
 *copies or substantial portions of the Software.
 *
 *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *SOFTWARE.
 */

const { default: axios } = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

class AnimeData {
  /**
   * Scrapes Anime from Gogoanime
   * @example
   * const anime = new AnimeData();
   *anime
   *  .searchAnime("oregairu")
   * .then((res) => {
   *   // console.log(res)
   *   // list of anime that matches the search
   *   anime.getAnimeInfo(res[0].link).then((info) => {
   *     // console.log(info);
   *     // Anime details
   *     anime.getEpisode(info.slug, 1).then((episode) =>
   *      // gets the specific episode of the anime
   *      console.log(episode)
   *    );
   *   });
   * })
   * .catch((err) => console.log(err));
   */
  constructor() {
    this.BASE_URI = "https://www1.gogoanime.ai";
  }

  /**
   * Get recent anime
   * @param {int} page - (Optional) Page number of recent anime
   * @return {Promise} Returns an Array of object of recent anime
   */
  async getRecent(page = 1) {
    try {
      if (page <= 0) {
        throw new Error("Page cannot be less than 1");
      }
      let animes = [];
      const { data } = await axios.get(`${this.BASE_URI}/?page=${page}`);
      const $ = cheerio.load(data);
      $(".items")
        .children("li")
        .each(function () {
          animes.push({
            img: $(this)
              .children(".img")
              .children("a")
              .children("img")
              .attr("src"),
            name: $(this).children(".name").text(),
            recent_episode: $(this).children(".episode").text(),
            link: $(this).children(".img").children("a").attr("href"),
            href:
              "/category" +
              $(this)
                .children(".img")
                .children("a")
                .attr("href")
                .replace(/-ep(.*)/g, ""),
          });
        });
      return animes;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Get Popular Anime
   * @param {int} page - (Optional) Page number of recent anime
   * @return {Promise} Returns an Array of object of recent anime
   */
  async getPopular(page = 1) {
    try {
      if (page <= 0) {
        throw new Error("Page cannot be less than 1");
      }
      let animes = [];
      const { data } = await axios.get(
        `${this.BASE_URI}/popular.html?page=${page}`
      );
      const $ = cheerio.load(data);
      $(".items")
        .children("li")
        .each(function () {
          let link =
            $(this).children(".img").children("a").attr("href") || null;
          let img =
            $(this)
              .children(".img")
              .children("a")
              .children("img")
              .attr("src") || null;
          let name = $(this).children(".name").text() || null;
          let release = $(this).children(".released").text().trim() || null;
          animes.push({ link, img, name, release });
        });
      return animes;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Get an anime info
   * @param {string} link - Provide the link to fetch an anime information
   * @return {Promise} Returns an object containing anime information
   */
  async getAnimeInfo(link) {
    if (!link) {
      throw new Error("No Url Provided");
    }
    try {
      let anime_info = {};
      const { data } = await axios.get(`${this.BASE_URI}${link}`);
      const $ = cheerio.load(data);
      anime_info["img"] = $("div.anime_info_body_bg img").attr("src") || null;
      anime_info["title"] = $("h1").text() || null;
      anime_info["slug"] = link.replace(/\/category\//g, "");
      $("div.anime_info_body p.type").each(function (i, el) {
        const $temp = cheerio.load($(el).html());
        let key = $(this)
          .children("span")
          .text()
          .toLowerCase()
          .trim()
          .replace(":", "")
          .replace(/\s/, "_");
        if (/plot_summary|released|other_name/g.test(key))
          anime_info[key] =
            $(el)
              .html()
              .replace(`<span>${$temp("span").text()}</span>`, "") || null;
        else if (/genre/g.test(key)) {
          let genre = [];
          $(el)
            .children("a")
            .each((i, el) => {
              genre.push($(el).attr("title"));
            });
          anime_info[key] = genre || null;
        } else anime_info[key] = $temp("a").text().trim() || null;
      });
      anime_info["episode_count"] =
        $("ul#episode_page li").eq(-1).children("a").attr("ep_end") || null;
      return anime_info;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Gets episode detail of an anime
   * @param {string} slug - provide anime slug (e.g. "one-piece"), you can get slug from fetching anime details
   * @param {int} ep - provide episode number
   * @returns {Promise} returns object containing episode details
   */
  async getEpisode(slug, ep) {
    if (!ep) throw new Error("Episode Number Not Provided");
    if (typeof ep !== "number") throw new Error("Episode needs to be a number");
    if (!slug) throw new Error("Slug Not Provided");
    try {
      let episodes = {};
      const { data } = await axios.get(
        `${this.BASE_URI}/${slug}-episode-${ep}`
      );
      const $ = cheerio.load(data);
      if ($("h1.entry-title").text() == "404") {
        throw new Error("No such episode found!");
      }

      let links = [];
      $("div.anime_muti_link ul li").each((i, el) => {
        links.push({
          name: $(el)
            .children("a")
            .text()
            .trim()
            .replace(/Choose this server/g, ""),
          link: $(el).children("a").attr("data-video").startsWith("https")
            ? $(el).children("a").attr("data-video")
            : "https:" + $(el).children("a").attr("data-video"),
        }) || null;
      });
      episodes["name"] = $("div.anime-info a").attr("title") || null;
      episodes["episode"] = ep || null;
      episodes["links"] = links || null;
      return episodes;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Search using name of anime
   * @param {string} name - name of the anime
   * @returns {Promise} returns array of matching anime details
   */
  async searchAnime(name) {
    if (!name) throw new Error("Anime name not provided");
    try {
      const { data } = await axios.get(
        `${this.BASE_URI}/search.html?keyword=${name}`
      );
      const $ = cheerio.load(data);
      if (
        $("ul.items")
          .text()
          .match(/Sorry, Not found/g)
      )
        throw new Error("Anime Not Found");
      let searched_animes = [];
      $("div.last_episodes ul.items li").each((i, el) => {
        searched_animes.push({
          img:
            $(el).children(".img").children("a").children("img").attr("src") ||
            null,
          title: $(el).children(".name").children("a").attr("title") || null,
          link: $(el).children(".name").children("a").attr("href") || null,
          released:
            $(el)
              .children(".released")
              .text()
              .replace(/Released:/g, "")
              .trim() || null,
        });
      });
      return searched_animes;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Retrive all genre
   * @returns {Promise} returns a list of all genres
   */
  async getAllGenre() {
    try {
      const { data } = await axios.get(`${this.BASE_URI}`);
      const $ = cheerio.load(data);
      const list_genre = [];
      $("nav.menu_series.genre.right ul li").each((i, el) => {
        list_genre.push($(el).children("a").attr("title"));
      });
      return list_genre;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Retrive anime based on Genre
   * @param {strin} name - Name of the genre
   * @param {int} page - (Optional) fetch by page number, default = 1
   */
  async getAnimeGenre(name, page = 1) {
    if (!name) throw new Error("No Genre name provided");
    try {
      let genre_anime = [];
      const { data } = await axios.get(
        `${this.BASE_URI}/genre/${name.toLowerCase()}?page=${page}`
      );
      const $ = cheerio.load(data);
      $(".items")
        .children("li")
        .each(function () {
          let link =
            $(this).children(".img").children("a").attr("href") || null;
          let img =
            $(this)
              .children(".img")
              .children("a")
              .children("img")
              .attr("src") || null;
          let name = $(this).children(".name").text() || null;
          let release = $(this).children(".released").text().trim() || null;
          genre_anime.push({ link, img, name, release });
        });
      return genre_anime;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Gets episode detail of an anime
   * @param {string} slug - provide anime slug (e.g. "oregairu"), you can get slug from fetching getAnimeInfo
   * @param {int} ep - provide episode number
   * @returns {Promise} returns object containing episode details
   */
  async getEpisodeFix(slug, ep) {
    if (!ep) throw new Error("Episode Number Not Provided");
    if (typeof ep !== "number") throw new Error("Episode needs to be a number");
    if (!slug) throw new Error("Slug Not Provided");
    try {
      const { data } = await axios.get(
        `${this.BASE_URI}/${slug}-episode-${ep}`
      );
      const $ = cheerio.load(data);
      let link = $("li.dowloads").children("a").attr("href");
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
      );
      await page.goto(link, {
        waitUntil: "networkidle2",
      });
      let animeEpLink = await page.evaluate(() => {
        let div_links = document.querySelectorAll(".dowload");
        let links = [...div_links].map((el) => {
          return {
            ep: el.querySelector("a").getAttribute("href"),
            title: el
              .querySelector("a")
              .text.replace(/Download/g, "")
              .replace(/\n/g, "")
              .trim(),
          };
        });
        return links;
      });
      await browser.close();
      return animeEpLink;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = AnimeData;

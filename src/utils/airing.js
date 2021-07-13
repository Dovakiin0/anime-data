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

class AnimeSchedule {
  constructor() {
    this.BASE_URI = "https://api.jikan.moe/v3/schedule/";
  }
  /**
   *
   * @param {string} day - (Optional) Provides the specific day schedule
   * @returns {Promise} returns schedule of all days in a week if no argument passed else specific day
   */
  async getSchedule(day = "") {
    let schedule = {};
    try {
      const { data } = await axios.get(this.BASE_URI + day);
      for (let [key, value] of Object.entries(data)) {
        if (
          /monday|tuesday|wednesday|thursday|friday|saturday|sunday/g.test(key)
        ) {
          schedule[key] = value;
        }
      }
      return this.reformSchedule(schedule);
    } catch (err) {
      console.error(err);
    }
  }

  reformSchedule(schedule) {
    let temp_schedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    for (let [key, value] of Object.entries(schedule)) {
      value.map((data) => {
        if (data.episodes !== null) {
          temp_schedule[key].push({
            title: data.title,
            img: data.image_url,
            episode: data.episodes,
            airing_time: data.airing_start,
          });
        }
      });
    }
    return temp_schedule;
  }
}

module.exports = AnimeSchedule;

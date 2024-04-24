import axios from "axios";
import { promises as fs } from 'fs';
const cliProgress = require("cli-progress");
import * as cheerio from "cheerio";
import { closestTo, formatISO, isValid } from "date-fns";
import {
  normalizeDateToISO,
  isOnlyYearDate,
  writeGamesToCSV,
  writeGamesToJSON,
  hasReleaseDateByCountryCode,
} from "./helpers";

export interface Game {
  id: number;
  score: number;
  originalScore: number;
  title: string;
  reviewsCount: number;
  link: string;
  releaseDate?: string;
}

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

export async function scrapSegaRetro(fileHeader: string) {
  const gameList = await getParsedGames();
  const gamesWithReleaseDates = await getGamesWithYears(gameList);
  writeGamesToCSV(gamesWithReleaseDates, `MDPathGames`, fileHeader);
  writeGamesToJSON(gamesWithReleaseDates, `MDPathGames`);
}

export async function getMobygamesNesData() {
  try {
    const games = await fetchGames();
    
    const gamesWithReviews = await fetchReviewsForGames(games);
    const gamesArray = buildGamesArray(gamesWithReviews);
    console.log(gamesArray.map((game) => game.title));
    writeGamesToCSV(gamesArray, `NESPathGames`, "Score, Original Score, Title, Reviews Count, Link, Release Date");
    writeGamesToJSON(gamesArray, `NESPathGames`);
  } catch (error) {
    console.error(error);
  }
}

async function fetchGames() {
  // const http = axios.create({
  //   baseURL: "https://api.mobygames.com/",
  // });

  const file = await fs.readFile(process.cwd() + '/mobygames_nes_game.json', 'utf8');
  const data = JSON.parse(file);

  // const response = await http.get(`/v1/games?platform=22&api_key=moby_RGomPDd0oe0RljWD6ajzuYSlDkg`);
  return data as Array<any>;
  // return response.data.games.slice(0, 20);
}

async function fetchReviewsForGames(games) {
  // const fetchGamesPromises = games.map((game) => {
  //   return {
  //     game: game,
  //     promise: axios.get(`${game.moby_url}reviews/`),
  //   };
  // });

  // const results = await Promise.all(
  //   fetchGamesPromises.map((item) => {
  //     return item.promise;
  //   })
  // );

  // return results.map((res, index) => {
  //   const game = fetchGamesPromises[index].game;
  //   const $ = cheerio.load(res.data);
  //   const reviews = JSON.parse($("reviews").attr(":reviews"));
  //   const nesReview = reviews.find((review: any) => review.platform === "NES");
  //     return { ...game, nesReview };
  // });

  // const fetchReviewsForGames = async (games) => {
  //   const gamesLength = games.length;
  //   let calls = [];

  //   for (let i = 0; i < gamesLength; i += 2) {
  //     const requests = games.slice(i, i + 2).map((game) => {
  //       return axios
  //         .get(`${game.moby_url}reviews/`)
  //         .catch((e) => console.log(`Error al enviar el email para el ${game} - ${e}`));
  //     });

  //     calls.push(
  //       await Promise.all(requests).catch((e) => console.log(`Error al enviar el mail para el lote ${i} - ${e}`))
  //     );
  //   }
  //   return calls.flat().map((res, i) => {
  //     const game = games[i];
  //     const $ = cheerio.load(res.data);
  //     const reviews = JSON.parse($("reviews").attr(":reviews"));
  //     const nesReview = reviews.find((review: any) => review.platform === "NES");
  //     return { ...game, nesReview };
  //   });
  // };

  const fetchGamesPromises = games.map((game) => {
    return {
      game: game,
      promise: axios.get(`${game.moby_url}reviews/`),
    };
  });

  const results = await Promise.all(
    fetchGamesPromises.map((item) => {
      return item.promise;
    })
  );

  const fetchReviewsForGames = async (results) => {
    const resultsLength = results.length;
    let calls = [];

    for (let i = 0; i < resultsLength; i += 2) {
      waitForSeconds(2)
      const requests = results.slice(i, i + 2).map((res, index) => {
        const game = fetchGamesPromises[index].game;
        const $ = cheerio.load(res.data);
        const reviews = JSON.parse($("reviews").attr(":reviews"));
        const nesReview = reviews.find((review: any) => review.platform === "NES");
        return { ...game, nesReview };
      });

      calls.push(
        requests
      );
    }
    return calls.flat()
  };

  return await fetchReviewsForGames(results);
}

function waitForSeconds(seconds) {
  const startTime = new Date().getTime();
  let currentTime;

  while (true) {
    currentTime = new Date().getTime();
    const elapsedSeconds = (currentTime - startTime) / 1000;

    if (elapsedSeconds >= seconds) {
      break;
    }
  }

  console.log(`It has been ${seconds} seconds.`);
}

function buildGamesArray(gamesWithReviews) {
  return gamesWithReviews.map(({ nesReview, title, moby_url, platforms }) => {
    const mobyScore = nesReview.moby_score * 10;
    const firstReleaseDate = platforms.find(({ platform_name }) => platform_name === "NES").first_release_date;
    return {
      id: 0,
      score: mobyScore,
      originalScore: mobyScore,
      title: title,
      reviewsCount: 0,
      link: moby_url,
      releaseDate: normalizeDateFromText(firstReleaseDate),
    };
  });
}

async function getParsedGames() {
  const gamesArray: Game[] = [];
  try {
    const res = await axios.get("https://segaretro.org/Mega_Drive_game_ratings");
    const $ = cheerio.load(res.data);

    $(".prettytable tbody tr").each((i, DOMGame) => {
      const score = getGameScore($(DOMGame));
      const title = getGameTitle($(DOMGame));
      const reviewsCount = getGameReviewsCount($(DOMGame));
      const link = getGameLink($(DOMGame));
      if (link) {
        gamesArray.push({
          id: i,
          score,
          originalScore: score,
          title,
          reviewsCount,
          link,
          releaseDate: "",
        });
      }
    });
  } catch (error) {
    console.error(error);
  }

  return gamesArray;
}

export async function getGamesWithYears(gamesArray: Game[]) {
  progressBar.start(gamesArray.length, 0);
  let progressBarCount = 0;
  for (const game of gamesArray) {
    if (!!game?.link) {
      try {
        const res = await axios.get(game.link);

        if (res.status === 200) {
          const $ = cheerio.load(res.data);
          let dates: Date[] = [];
          $(".breakout:nth-child(1) tbody tr").each((_, DOMReleaseData) => {
            const releaseCountry = getReleaseCountry($(DOMReleaseData));
            const releaseConsole = getReleaseConsole($(DOMReleaseData));
            if (
              releaseConsole === "Sega Mega Drive" &&
              (hasReleaseDateByCountryCode("JP", releaseCountry) ||
                hasReleaseDateByCountryCode("US", releaseCountry) ||
                hasReleaseDateByCountryCode("EU", releaseCountry))
            ) {
              let releaseDate = getReleaseDate($(DOMReleaseData));
              if (isValid(new Date(releaseDate))) {
                dates.push(new Date(releaseDate));
              }
            }
          });
          if (dates?.length) {
            const earlierReleaseDate = closestTo(new Date("1988-01-01"), dates);
            if (earlierReleaseDate) game.releaseDate = formatISO(earlierReleaseDate, { representation: "date" });
          }
        }
      } catch (error: any) {
        console.error(error.message);
        if (error.config) {
          console.error(error.config.url);
        }
      }
    }
    progressBarCount++;
    progressBar.update(progressBarCount);
  }
  progressBar.stop();
  return gamesArray;
}

function getGameScore(element: cheerio.Cheerio<cheerio.Element>): number {
  return Number(element.find("td:nth-child(1)").text().replace(/\s\s+/g, "").trim());
}

function getGameTitle(element: cheerio.Cheerio<cheerio.Element>) {
  return element.find("td:nth-child(2)").text().trim();
}

function getGameReviewsCount(element: cheerio.Cheerio<cheerio.Element>): number {
  return Number(element.find("td:nth-child(3)").text().replace(/\s\s+/g, "").trim());
}

function getGameLink(element: cheerio.Cheerio<cheerio.Element>) {
  const detailsLink = element.find("td:nth-child(2) a").attr("href");
  if (detailsLink) {
    return `https://segaretro.org${detailsLink}`;
  } else {
    return "";
  }
}

function getReleaseCountry(element: cheerio.Cheerio<cheerio.Element>) {
  return element.find("td:nth-child(1)").text().trim();
}

function getReleaseConsole(element: cheerio.Cheerio<cheerio.Element>) {
  return element.find("td:nth-child(1) a").attr("title");
}

function getReleaseDate(element: cheerio.Cheerio<cheerio.Element>) {
  let releaseDate = element.find("td:nth-child(2) span").text().trim();

  return normalizeDateFromText(releaseDate);
}

function isNesReviewRow(element: cheerio.Cheerio<cheerio.Element>): boolean {
  return element.find("td:nth-child(1)").text().trim() === "NES";
}

function getNesScore(element: cheerio.Cheerio<cheerio.Element>): number {
  return Number(element.find("mobyscore").text().trim());
}

function normalizeDateFromText(date: string) {
  let normalizedDate = date;

  if (isOnlyYearDate(date)) {
    normalizedDate = `${date}-06-01`;
  }
  return normalizeDateToISO(normalizedDate);
}

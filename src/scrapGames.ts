import axios from "axios";
const cliProgress = require("cli-progress");
import * as cheerio from "cheerio";
import { closestTo, formatISO, isValid } from "date-fns";
import {
  normalizeDateToISO,
  groupEarlyGamesByDate,
  isOnlyYearDate,
  writeGamesToCSV,
  writeGamesToJSON,
  hasReleaseDateByCountryCode,
} from "./helpers";

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

export async function scrapSegaRetro(fileHeader: string) {
  const gameList = await getParsedGames();
  const gamesWithReleaseDates = await getGamesWithYears(gameList);
  const finalGameList = groupEarlyGamesByDate(gamesWithReleaseDates, "1989-12-01");
  writeGamesToCSV(finalGameList, `MDPathGames`, fileHeader);
  writeGamesToJSON(finalGameList, `MDPathGames`);
}

export interface Game {
  score: number;
  originalScore: number
  title: string;
  reviewsCount: number;
  link: string;
  releaseDate?: string;
}

async function getParsedGames() {
  const gamesArray: Game[] = [];
  try {
    const res = await axios.get("https://segaretro.org/Mega_Drive_game_ratings");
    const $ = cheerio.load(res.data);

    $(".prettytable tbody tr").each((_, DOMGame) => {
      const score = getGameScore($(DOMGame));
      const title = getGameTitle($(DOMGame));
      const reviewsCount = getGameReviewsCount($(DOMGame));
      const link = getGameLink($(DOMGame));
      if (link) {
        gamesArray.push({
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
  if (isOnlyYearDate(releaseDate)) {
    releaseDate = `${releaseDate}-06-01`;
  }
  return normalizeDateToISO(releaseDate);
}

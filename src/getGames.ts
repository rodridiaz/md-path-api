import { isValid, isEqual, isBefore, differenceInCalendarMonths } from "date-fns";
import fs from "fs";
import { applyWearPoints, getMDPathDatesBetweenTwoDates, mergeGamesLists } from "./helpers";
import { Game } from "./scrapGames";

export interface GamesMonthData {
  oldTop: Game[] | null;
  top: Game[] | null;
  topListHistory: Game[] | null;
  updatedList: Game[] | null;
  additions: Game[] | null;
  exclusions: Game[] | null;
}

export function getGamesMonthData(
  firstGameRelease: string | number | Date,
  mdPathDate: string | number | Date,
  wearPoints: number,
  intervalMonthsWidth: number
): GamesMonthData {
  if (!isValid(new Date(mdPathDate) || !isValid(new Date(firstGameRelease)))) {
    throw new Error("Invalid Date!");
  }

  const gamesMonthData: GamesMonthData = {
    top: null,
    oldTop: null,
    topListHistory: null,
    updatedList: null,
    additions: null,
    exclusions: null,
  };

  const dates = getMDPathDatesBetweenTwoDates(firstGameRelease, mdPathDate);

  const currentGameListData = fs.readFileSync(`./MDPathGames.json`, "utf-8");
  let gameList = JSON.parse(currentGameListData).map((game: Game) => ({ ...game, originalScore: game.score } as Game));
  let topGamesInCurrentDate;

  for (const date of dates) {
    const currentDate = new Date(date);

    if (dates.indexOf(date) === dates.length - 1) {
      gamesMonthData.oldTop = topGamesInCurrentDate;
    }
    topGamesInCurrentDate = gameList
      .filter((game: Game) => {
        const releaseDate = new Date(game.releaseDate as string);
        return (
          (isEqual(releaseDate as Date, currentDate) || isBefore(releaseDate as Date, currentDate)) &&
          differenceInCalendarMonths(currentDate, releaseDate as Date) <= intervalMonthsWidth
        );
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 10);

    gamesMonthData.top = topGamesInCurrentDate;
    gamesMonthData.topListHistory = mergeGamesLists(gamesMonthData.topListHistory, gamesMonthData.top);

    const updatedGamesInCurrentPeriod = applyWearPoints(wearPoints, topGamesInCurrentDate);

    if (gamesMonthData.oldTop?.length) gamesMonthData.oldTop = applyWearPoints(wearPoints, gamesMonthData.oldTop);

    gameList = mergeGamesLists(gameList, updatedGamesInCurrentPeriod);

    gamesMonthData.updatedList = gameList;
    gamesMonthData.additions = getGameAdditions(gamesMonthData.top, gamesMonthData.oldTop);
    gamesMonthData.exclusions = getGameExclusions(gamesMonthData.top, gamesMonthData.oldTop);
  }

  return gamesMonthData;
}

function getGameAdditions(top: Game[] | null, oldTop: Game[] | null) {
  if (!top?.length || !oldTop?.length) {
    return null;
  }
  const additions = top?.filter((game) => !oldTop?.some((oldGame) => oldGame.title === game.title));
  return additions;
}

function getGameExclusions(top: Game[] | null, oldTop: Game[] | null) {
  if (!top?.length || !oldTop?.length) {
    return null;
  }
  const exclusions = oldTop?.filter((game) => !top?.some((oldGame) => oldGame.title === game.title));
  return exclusions;
}

export function getAllGames() {
  const currentGameListData = fs.readFileSync(`./MDPathGames.json`, "utf-8");
  return currentGameListData;
}

import { Game } from "./scrapGames";

const fs = require("fs");
const { formatISO, differenceInCalendarMonths, isValid, add } = require("date-fns");

export function writeGamesToCSV(gameList: Game[] | null, filename: string, headerCommaSeparated: string) {
  if (!gameList?.length) {
    throw Error("gameList empty: cannot create the csv file");
  }
  const writeStream = fs.createWriteStream(`${filename}.csv`);
  writeStream.write(`${headerCommaSeparated}\n`);
  gameList.forEach((game: Game) => {
    writeStream.write(
      `${Number(game.score).toFixed(2)},${Number(game.originalScore).toFixed(2)},${game.title},${game.reviewsCount},${game.link},${game.releaseDate}\n`,
      (error: any) => {
        if (error) {
          return console.log(error);
        }
      }
    );
  });
  console.log(`The file ${filename}.csv was saved!`);
}

export function writeGamesToJSON(gameList: Game[] | null, filename: string) {
  if (!gameList?.length) {
    throw Error("gameList empty: cannot create the json file");
  }
  fs.writeFile(`${filename}.json`, JSON.stringify(gameList), (err: any) => {
    if (err) {
      return console.log(err);
    }
    console.log(`The file ${filename}.json was saved!`);
  });
}

export function isOnlyYearDate(date: string) {
  if (!date) {
    return false;
  }
  const years = ["1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998"];
  return years.some((year) => year === date);
}

export function normalizeDateToISO(date: string) {
  let isoDate = "";
  if (date.includes("[")) {
    isoDate = formatISO(new Date(date.substring(0, date.indexOf("["))), {
      representation: "date",
    });
  } else {
    if (!isValid(new Date(date))) {
      return date;
    }
    isoDate = formatISO(new Date(date), {
      representation: "date",
    });
  }
  return isoDate;
}

export function mergeGamesLists(games: Game[] | null, updatedGames: any) {
  const mergedGames = new Map();
  // 2. concat array
  // arr1.concat(arr2) === [...arr1, ...arr2]
  const concatLists = [...(games || []), ...updatedGames];

  // 3. for ... of, iterator array
  for (const obj of concatLists) {
    // update
    mergedGames.set(obj.title, {
      ...mergedGames.get(obj.title),
      ...obj,
    });
  }
  // 4. get new merged unqiue array
  return [...mergedGames.values()];
}

export function applyWearPoints(wearPoints: number, games: Game[]) {
  if (!games) {
    return;
  }
  const updatedGames = games.map((game: Game, index: number, array: any) => ({
    ...game,
    score: index <= 9 ? game.score - wearPoints : game.score,
  }));

  return updatedGames;
}

export function getMDPathDatesBetweenTwoDates(beforeDate: string | number | Date, afterDate: string | number | Date) {
  if (!isValid(new Date(afterDate)) || !isValid(new Date(beforeDate))) {
    throw new Error("wrong date!");
  }
  const diff = differenceInCalendarMonths(new Date(afterDate), new Date(beforeDate));
  let count = 1;
  const firstDate = formatISO(new Date(beforeDate), { representation: "date" });
  const dateList = [firstDate];
  while (count <= diff) {
    const newDate = formatISO(add(new Date(dateList[dateList.length - 1]), { months: 1 }), { representation: "date" });
    dateList.push(newDate);
    count++;
  }
  return dateList;
}

export function hasReleaseDateByCountryCode(countryCode: string, releaseCountry: string) {
  return countryCode === releaseCountry;
}

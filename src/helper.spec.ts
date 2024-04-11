import { id } from "date-fns/locale";
import { getMDPathDatesBetweenTwoDates, mergeGamesLists } from "./helpers";
import { Game, getGamesWithYears } from "./scrapGames";

describe("getMDPathDatesBetweenTwoDates()", () => {
  test("throw error when dates are not correct", () => {
    expect(() => getMDPathDatesBetweenTwoDates("wrong date", "1989-11-01")).toThrow(Error("wrong date!"));
    expect(() => getMDPathDatesBetweenTwoDates("1989-11-01", "wrong date")).toThrow(Error("wrong date!"));
  });

  test("return date array correctly when interval is 0", () => {
    const datesArray = getMDPathDatesBetweenTwoDates("1989-11-01", "1989-11-01");

    const expectedDates = ["1989-11-01"];
    expect(datesArray).toStrictEqual(expectedDates);
  });

  test("return date array correctly when interval is 1", () => {
    const datesArray = getMDPathDatesBetweenTwoDates("1989-11-01", "1989-12-01");

    const expectedDates = ["1989-11-01", "1989-12-01"];
    expect(datesArray).toStrictEqual(expectedDates);
  });

  test("return date array correctly when interval is > 2", () => {
    const datesArray = getMDPathDatesBetweenTwoDates("1989-11-01", "1990-02-01");

    const expectedDates = ["1989-11-01", "1989-12-01", "1990-01-01", "1990-02-01"];
    expect(datesArray).toStrictEqual(expectedDates);
  });
});

describe("mergeGamesLists()", () => {
  const games: Game[] = [
    {
      id: 0,
      score: 75.3999629629630475,
      originalScore: 75.3999629629630475,
      title: "Arnold Palmer Tournament Golf",
      reviewsCount: 27,
      link: "https://segaretro.org/Arnold_Palmer_Tournament_Golf",
      releaseDate: "1989-09-09",
    },
    {
      id: 1,
      score: 60.4242413793103456,
      originalScore: 60.4242413793103456,
      title: "Arrow Flash",
      reviewsCount: 29,
      link: "https://segaretro.org/Arrow_Flash",
      releaseDate: "1990-10-20",
    },
    {
      id: 2,
      score: 57.221757,
      originalScore: 57.221757,
      title: "Art Alive!",
      reviewsCount: 20,
      link: "https://segaretro.org/Art_Alive!",
      releaseDate: "1991-06-01",
    },
  ];

  const updatedGames: Game[] = [
    {
      id: 0,
      score: 75.3999629629630475,
      originalScore: 75.3999629629630475,
      title: "Arnold Palmer Tournament Golf",
      reviewsCount: 27,
      link: "https://segaretro.org/Arnold_Palmer_Tournament_Golf",
      releaseDate: "1989-09-09",
    },
    {
      id: 1,
      score: 60.4242413793103456,
      originalScore: 60.4242413793103456,
      title: "Arrow Flash",
      reviewsCount: 29,
      link: "https://segaretro.org/Arrow_Flash",
      releaseDate: "1989-09-09",
    },
    {
      id: 2,
      score: 57.221757,
      originalScore: 57.221757,
      title: "Art Alive!",
      reviewsCount: 20,
      link: "https://segaretro.org/Art_Alive!",
      releaseDate: "1989-09-09",
    },
  ];

  test("return array merged correctly", () => {
    const mergedGameList = mergeGamesLists(games, updatedGames);

    expect(mergedGameList.length).toBe(games.length);

    mergedGameList.forEach((game: Game) => {
      expect(new Date(game.releaseDate as string)).toStrictEqual(new Date("1989-09-09"));
    });
  });

  test("return array merged correctly when null param", () => {
    const mergedGameList = mergeGamesLists(null, updatedGames);

    expect(mergedGameList.length).toBe(games.length);

    mergedGameList.forEach((game: Game) => {
      expect(new Date(game.releaseDate as string)).toStrictEqual(new Date("1989-09-09"));
    });
  });
});

describe("getGamesWithYears()", () => {
  const games = [
    {
      id: 0,
      score: 84.96481578947379,
      originalScore: 84.96481578947379,
      title: "Super Monaco GP",
      reviewsCount: 38,
      link: "https://segaretro.org/Super_Monaco_GP",
      releaseDate: "",
    },
  ];

  test("return date array correctly when interval is 0", async () => {
    const scrappedGames = await getGamesWithYears(games);

    expect(scrappedGames.length).toBe(1);
  });
});

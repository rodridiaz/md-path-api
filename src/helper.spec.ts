import { getMDPathDatesBetweenTwoDates, groupEarlyGamesByDate, mergeGamesLists } from "./helpers";
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

describe("groupEarlyGamesByDate()", () => {
  const games: Game[] = [
    {
      score: 75.3999629629630475,
      title: "Arnold Palmer Tournament Golf",
      reviewsCount: 27,
      link: "https://segaretro.org/Arnold_Palmer_Tournament_Golf",
      releaseDate: "1989-09-09",
    },
    {
      score: 60.4242413793103456,
      title: "Arrow Flash",
      reviewsCount: 29,
      link: "https://segaretro.org/Arrow_Flash",
      releaseDate: "1990-10-20",
    },
    {
      score: 57.221757,
      title: "Art Alive!",
      reviewsCount: 20,
      link: "https://segaretro.org/Art_Alive!",
      releaseDate: "1991-06-01",
    },
    {
      score: 70.456521739130447,
      title: "Astérix and the Great Rescue",
      reviewsCount: 23,
      link: "https://segaretro.org/Ast%C3%A9rix_and_the_Great_Rescue_(Mega_Drive)",
      releaseDate: "1993-10-01",
    },
    {
      score: 58.9412859,
      title: "Art of Fighting",
      reviewsCount: 25,
      link: "https://segaretro.org/Art_of_Fighting",
      releaseDate: "1994-01-14",
    },
  ];
  test("throw error when until date is not correct", () => {
    expect(() => groupEarlyGamesByDate(games, "1993-10-02")).toThrow(Error);
  });

  test("return correct data", () => {
    const adjustedGameList = groupEarlyGamesByDate(games, "1993-10-01");

    adjustedGameList.slice(0, 3).forEach((game) => {
      expect(new Date(game.releaseDate)).toStrictEqual(new Date("1993-09-01"));
    });
  });
});

describe("mergeGamesLists()", () => {
  const games: Game[] = [
    {
      score: 75.3999629629630475,
      title: "Arnold Palmer Tournament Golf",
      reviewsCount: 27,
      link: "https://segaretro.org/Arnold_Palmer_Tournament_Golf",
      releaseDate: "1989-09-09",
    },
    {
      score: 60.4242413793103456,
      title: "Arrow Flash",
      reviewsCount: 29,
      link: "https://segaretro.org/Arrow_Flash",
      releaseDate: "1990-10-20",
    },
    {
      score: 57.221757,
      title: "Art Alive!",
      reviewsCount: 20,
      link: "https://segaretro.org/Art_Alive!",
      releaseDate: "1991-06-01",
    },
  ];

  const updatedGames: Game[] = [
    {
      score: 75.3999629629630475,
      title: "Arnold Palmer Tournament Golf",
      reviewsCount: 27,
      link: "https://segaretro.org/Arnold_Palmer_Tournament_Golf",
      releaseDate: "1989-09-09",
    },
    {
      score: 60.4242413793103456,
      title: "Arrow Flash",
      reviewsCount: 29,
      link: "https://segaretro.org/Arrow_Flash",
      releaseDate: "1989-09-09",
    },
    {
      score: 57.221757,
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
      score: 84.96481578947379,
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

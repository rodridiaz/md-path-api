import express, { Express } from "express";
import { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { getAllGames, getGamesMonthData } from "./getGames";
import { getMobygamesNesData } from "./scrapGames";

const PORT = process.env.PORT || 4300;
const app: Express = express();

const FirstGameRelease = "1988-10-01";
const IntervalMonthsWidth = 999999;
const WearPoints = 3;

// app.use(helmet());
// app.use(cors());
// app.use(express.json());

// app.get("/mega-drive-path-games/", (req: Request, res: Response) => {
//   let results;
//   const date = req.query.date as string;
//   if (date) {
//     results = getGamesMonthData(FirstGameRelease, date, WearPoints, IntervalMonthsWidth);
//   } else {
//     results = getAllGames();
//   }
//   res.json(results);
// });

getMobygamesNesData()

export default app;
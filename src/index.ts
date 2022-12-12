import * as inquirer from "inquirer";
import express, { Express } from "express";
import { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { scrapSegaRetro } from "../src/scrapGames";
import { getAllGames, getGamesMonthData } from "../src/getGames";
import { getMDPathDatesBetweenTwoDates, writeGamesToCSV, writeGamesToJSON } from "../src/helpers";

const PORT = process.env.PORT || 4300;
const app: Express = express();

const FileHeader = "Score, Title, Reviews Count, Link, Release Date";
const FirstGameRelease = "1989-11-01";
const IntervalMonthsWidth = 5;
const WearPoints = 3;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/mega-drive-path-games/", (req: Request, res: Response) => {
  let results;
  const date = req.query.date as string;
  if (date) {
    results = getGamesMonthData(FirstGameRelease, date, WearPoints, IntervalMonthsWidth);
  } else {
    results = getAllGames();
  }
  res.json(results);
});

app.listen(PORT, async () => {
  //   //   try {
  //   //     const yearChoices = ["1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997"];
  //   //     const monthChoices = getMDPathDatesBetweenTwoDates("1989-11-01", "1997-10-01");
  //   //     inquirer
  //   //       .prompt([
  //   //         {
  //   //           type: "list",
  //   //           name: "action",
  //   //           message: "What do you want to do?",
  //   //           choices: ["Scrap Sega retro", "Get Mega Drive Path Info By Month", new inquirer.Separator()],
  //   //         },
  //   //         {
  //   //           type: "list",
  //   //           name: "mdYear",
  //   //           message: "Please, select a year",
  //   //           when(answers: any) {
  //   //             return answers.action == "Get Mega Drive Path Info By Month";
  //   //           },
  //   //           choices: yearChoices,
  //   //         },
  //   //         {
  //   //           type: "list",
  //   //           name: "mdDate",
  //   //           message: "Please, select a month",
  //   //           when(answers: any) {
  //   //             return answers.action == "Get Mega Drive Path Info By Month";
  //   //           },
  //   //           choices(answers: any) {
  //   //             return monthChoices.filter((date) => date.includes(answers.mdYear));
  //   //           },
  //   //         },
  //   //         {
  //   //           type: "confirm",
  //   //           name: "fileStorage",
  //   //           message: "Do you want to save results in a file?",
  //   //           default: true,
  //   //           when(answers: any) {
  //   //             return answers.action == "Get Mega Drive Path Info By Month";
  //   //           },
  //   //         },
  //   //         {
  //   //           type: "checkbox",
  //   //           message: "Select File Type",
  //   //           name: "fileType",
  //   //           choices: [
  //   //             {
  //   //               name: "csv",
  //   //             },
  //   //             {
  //   //               name: "json",
  //   //             },
  //   //           ],
  //   //           when(answers: any) {
  //   //             return !!answers.fileStorage;
  //   //           },
  //   //           validate(answer: any) {
  //   //             console.log(answer);
  //   //             if (answer.length < 1) {
  //   //               return "You must choose at least one file type.";
  //   //             }
  //   //             return true;
  //   //           },
  //   //         },
  //   //       ])
  //   //       .then(async (answers: any) => {
  //   //         if (answers.action == "Scrap Sega retro") {
  //   //           await scrapSegaRetro(FileHeader);
  //   //         } else if (answers.action == "Get Mega Drive Path Info By Month") {
  //   //           const topTen = getGamesMonthData(FirstGameRelease, answers.mdDate, WearPoints, IntervalMonthsWidth);
  //   //           if (!!answers.fileStorage) {
  //   //             const wasCsvSelected = answers.fileType.includes("csv");
  //   //             const wasJsonSelected = answers.fileType.includes("json");
  //   //             if (wasCsvSelected) {
  //   //               writeGamesToCSV(topTen.top, `TopMDPathGames-${answers.mdDate}`, FileHeader);
  //   //             }
  //   //             if (wasJsonSelected) {
  //   //               writeGamesToJSON(topTen.top, `TopMDPathGames-${answers.mdDate}`);
  //   //             }
  //   //           }
  //   //         }
  //   //       });
  //   //   } catch (error) {
  //   //     console.error(error);
  //   //   }
  //   console.log(`Running on ${PORT} ⚡`);
});

export default app;

// export default async (req: Request, res: Response) => {
//   res.json({ message: "Hello guys. Welcome to Vercel" });
// };

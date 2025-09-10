"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https")); //https for HTTPS request fro the API
const fs_1 = __importDefault(require("fs")); // read/wirte files locally 
const apiInterfaces_1 = require("./Interfaces/apiInterfaces");
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https_1.default.get(url, (res) => {
            let data = "";
            // Collect incoming data
            res.on("data", (chunk) => {
                data += chunk;
            });
            // When response ends
            res.on("end", () => {
                if (!data || data.length === 0) {
                    reject(new Error("No data received from API"));
                    return;
                }
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                }
                catch (_a) {
                    reject(new Error("Failed to parse JSON response"));
                }
            });
        })
            .on("error", (err) => {
            reject(err); // Network-level errors
        });
    });
}
function saveToFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Fetching weather data...");
            // Fetch Weather Data
            const weatherData = yield fetchData("https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&current_weather=true");
            console.log("Current Weather:", weatherData.current_weather);
            console.log("\nFetching news data...");
            // Fetch News Data
            const newsData = yield fetchData("https://dummyjson.com/posts");
            const topHeadlines = newsData.posts.slice(0, 3).map((post) => post.title);
            console.log("Top 3 News Headlines:");
            topHeadlines.forEach((headline, index) => {
                console.log(`${index + 1}. ${headline}`);
            });
            console.log("\nSaving all data to results.json...");
            yield saveToFile("results.json", apiInterfaces_1.Results);
            console.log("All data successfully saved to results.json!");
        }
        catch (error) {
            console.error("An error occurred:", error.message);
        }
    });
}
main();

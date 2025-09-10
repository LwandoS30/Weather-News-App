"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const apiInterfaces_1 = require("./Interfaces/apiInterfaces");
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https_1.default.get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                if (!data || data.length === 0) {
                    reject(new Error("No data received from API"));
                    return;
                }
                const parseData = JSON.parse(data || "{}");
                if (!parseData || typeof parseData !== "object") {
                    reject(new Error("Invalid JSON structure received"));
                    return;
                }
                resolve(parseData);
            });
        }).on("error", (err) => {
            reject(err);
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
console.log("Starting data fetch sequence...");
fetchData("https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&currentWeather=true")
    .then((weatherData) => {
    if (!weatherData || !weatherData.currentData) {
        throw new Error("Weather Error: Missing weather data");
    }
    console.log("Weather fetch successfully");
    console.log("Current Weather: ", weatherData.currentData);
    return Promise.all([weatherData, fetchData("https://dummyjson.com/posts")]);
})
    .then(([weatherData, newsData]) => {
    if (newsData || !Array.isArray(newsData.posts)) {
        throw new Error("News Error: Invalid or missing posts array");
    }
    const topHeadlines = newsData.posts.slice(0, 3).map((post) => post.title);
    console.log("\nTop three News Headlines:");
    topHeadlines.forEach((headline, index) => {
        console.log(`${index + 1}. ${headline}`);
    });
    return saveToFile("result.json", apiInterfaces_1.Results);
}).then(() => {
    console.log("\All rdata successfully saved to result.json!");
}).catch((err) => {
    console.error("An error occured: ", err.message);
});

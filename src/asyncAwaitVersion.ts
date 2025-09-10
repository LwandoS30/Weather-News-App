import https from "https"; //https for HTTPS request fro the API
import fs from "fs"; // read/wirte files locally 
import { WeatherData, NewsData, Post, Results } from './Interfaces/apiInterfaces';

function fetchData<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
            resolve(parsedData as T);
          } catch {
            reject(new Error("Failed to parse JSON response"));
          }
        });
      })
      .on("error", (err) => {
        reject(err); // Network-level errors
      });
  });
}

function saveToFile<T>(filePath: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function main() {
  try {
    console.log("Fetching weather data...");

    // Fetch Weather Data
    const weatherData = await fetchData<WeatherData>(
      "https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&currentWeather=true"
    );

    console.log("Current Weather:", weatherData.currentWeather);

    console.log("\nFetching news data...");

    // Fetch News Data
    const newsData = await fetchData<NewsData>("https://dummyjson.com/posts");

    const topHeadlines = newsData.posts.slice(0, 3).map((post: { title: any; }) => post.title);

    console.log("Top 3 News Headlines:");
    topHeadlines.forEach((headline: any, index: number) => {
      console.log(`${index + 1}. ${headline}`);
    });

    console.log("\nSaving all data to results.json...");
    await saveToFile("result.json", Results);

    console.log("All data successfully saved to results.json!");
  } catch (error: any) {
    console.error("An error occurred:", error.message);
  }
}

main();

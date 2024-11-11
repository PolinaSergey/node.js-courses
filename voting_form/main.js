const express = require("express");
const path = require("path");
const fs = require('fs');

const webserver = express();

webserver.use(express.urlencoded({ extended:true }));

const PORT = 8381;
const STATISTICS_FILENAME = path.resolve(__dirname, "statistics.txt");

const variants = [
    { code: "tea", label: "Чай" },
    { code: "coffee", label: "Кофе" },
    { code: "juice", label: "Сок" },
];

const initialStat = {
    "tea": 0,
    "coffee": 0,
    "juice": 0,
};

const getStatistics = () => {
    try {
        const statFd = fs.readFileSync(STATISTICS_FILENAME);
        return JSON.parse(statFd.toString());
    } catch {
        fs.appendFileSync(STATISTICS_FILENAME, JSON.stringify(initialStat));
        return initialStat;
    }
}

const setStatistics = (data) => {
    const currStatistics = getStatistics();
    currStatistics[data.drink] += 1;

    const statFd = fs.openSync(STATISTICS_FILENAME, "w");
    fs.writeSync(statFd, JSON.stringify(currStatistics));
    fs.closeSync(statFd);

    return currStatistics;
}

const getStatisticsXml = (stat) => {
    let xmlResp = "<statistics>";
    for (const {code, label} of variants) {
        xmlResp += `<${label}>${stat[code]}</${label}>`;
    }
    xmlResp += "</statistics>";
    return xmlResp;
}

const getStatisticsHtml = (stat) => {
    let htmlResp = "<ul>";
    for (const {code, label} of variants) {
        htmlResp += `<li>${label}: ${stat[code]}</li>`;
    }
    htmlResp += "</ul>";
    return htmlResp;
}

webserver.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

webserver.get("/variants", (req, res) => {
    res.send(JSON.stringify(variants));
});

webserver.post("/vote", (req, res) => {
    console.log(req.body);
    const newStatistics = setStatistics(req.body);
    res.send(JSON.stringify(newStatistics));
});

webserver.post("/statistics", (req, res) => {
    const statistics = getStatistics();

    const acceptHeader = req.headers.accept;
    if (acceptHeader === "application/json") {
        res.setHeader("Content-Type", "application/json");
        res.send(statistics);
    } else if (acceptHeader === "application/xml") {
        res.setHeader("Content-Type", "application/xml");
        const xmlResponse = getStatisticsXml(statistics);
        res.send(xmlResponse);
    } else if (acceptHeader === "text/html") {
        res.setHeader("Content-Type", "text/html");
        const htmlResponse = getStatisticsHtml(statistics);
        res.send(htmlResponse);
    } else {
        res.setHeader("Content-Type", "text/plain");
        res.send(JSON.stringify(statistics));
    }
});

webserver.listen(PORT,()=> {
    console.log("web server running on port " + PORT);
});

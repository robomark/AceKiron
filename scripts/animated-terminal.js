const fs = require("fs");
const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");
const axios = require("axios");

const apiKey = process.env.GH_API_KEY;
const url = "https://api.github.com/graphql";

const username = "AceKiron";
const usernameLowercase = "acekiron";

section2 = ({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers }) => {
    const width = 450;
    const height = 338;

    const filename = "./assets/animated-terminal.gif";

    class TerminalCanvas {
        constructor(width, height) {
            this.fontSize = 12;
            this.padding = 7;

            this.ctx = createCanvas(width, height).getContext("2d");
            this.ctx.font = this.fontSize + 'px "Consolas"';

            this.lines = [];
            this.padding = padding;

            this.width = width;
            this.height = height;

            this.maxLines = Math.floor((height - padding * 4) / this.fontSize);

            this.renderCount = 0;
        }

        addLine(text) {
            this.lines.push(text);
            if (this.lines.length > this.maxLines) {
                this.lines.shift();
            }
        }

        editLine(cb) {
            let line = this.lines.pop();
            this.lines.push(cb(line));
        }

        clear() {
            this.lines = [];
        }

        render() {
            console.log(`Calling render() for the ${this.renderCount}th time.`);
            this.renderCount++;

            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.strokeStyle = "#ff00ff";

            this.ctx.beginPath();

            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = "#ff00ff";
            
            this.ctx.moveTo(this.padding, this.padding);
            this.ctx.lineTo(this.padding, this.height - this.padding);
            this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
            this.ctx.lineTo(this.width - this.padding, this.padding);
            this.ctx.lineTo(this.padding, this.padding);

            this.ctx.stroke();

            this.ctx.fillStyle = "white";

            for (let i = 0; i < this.lines.length; i++) {
                let line = this.lines[i];
                this.ctx.fillText(line, this.padding * 2, this.padding * 2 + (i + 1) * this.fontSize, this.width - this.padding * 4);
            }

            return this.ctx;
        }
    };

    function typeWriter(tc, encoder, originalLine, writingText) {
        tc.addLine(originalLine);
        encoder.addFrame(tc.render());

        while (writingText != "") {
            tc.editLine((line) => {
                return line.replace("_", writingText[0] + "_");
            });
            encoder.addFrame(tc.render());

            writingText = writingText.slice(1);
        }

        tc.editLine((line) => {
            return line.replace("_", "");
        });
    }

    const tc = new TerminalCanvas(width, height);

    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(filename));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(125);
    encoder.setQuality(10);

    function addFrameLooped(encoder, frame, count) {
        for (let i = 0; i < count; i++) {
            encoder.addFrame(frame);
        }
    }

    tc.addLine("Release gitBIOS v2022.1 - Build date April 7th 2022");
    tc.addLine("(C) AceKiron 2022");
    tc.addLine("");
    addFrameLooped(encoder, tc.render(), 2);

    tc.addLine("WAIT...");
    addFrameLooped(encoder, tc.render(), 6);

    tc.clear();

    tc.addLine("Starting GitHubOS...");
    addFrameLooped(encoder, tc.render(), 2);

    tc.clear();

    typeWriter(tc, encoder, `${usernameLowercase}@127.0.0.1: ~$ _", "./checkout ${username}`);

    tc.addLine("Fetching data from GitHub APIs...");
    tc.addLine("");
    addFrameLooped(encoder, tc.render(), 13);

    // { totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers }
    console.log({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers });

    tc.addLine("Total stars earned: " + totalStars);
    encoder.addFrame(tc.render());

    tc.addLine("Total Commits:      " + totalCommits);
    encoder.addFrame(tc.render());

    encoder.addFrame(tc.render());

    tc.addLine("Total PRs:          " + totalPRs);
    encoder.addFrame(tc.render());

    tc.addLine("Total Issues:       " + totalIssues);
    encoder.addFrame(tc.render());

    tc.addLine("Contributed to:     " + contributedTo);
    encoder.addFrame(tc.render());

    tc.addLine("Followers:          " + followers);
    addFrameLooped(encoder, tc.render(), 3);

    // tc.addLine("");
    // tc.addLine("Most used languages:");
    // encoder.addFrame(tc.render());

    // tc.addLine("Assembly            35.90%");
    // encoder.addFrame(tc.render());

    // tc.addLine("Java                30.42%");
    // encoder.addFrame(tc.render());

    // tc.addLine("JavaScript          16.51%");
    // encoder.addFrame(tc.render());

    // tc.addLine("C                   13.70%");
    // encoder.addFrame(tc.render());

    // tc.addLine("Makefile            3.47%");
    // encoder.addFrame(tc.render());

    tc.addLine(`${usernameLowercase}@127.0.0.1: ~$ _`);
    addFrameLooped(encoder, tc.render(), 24);

    encoder.finish();
}

axios({
    url: url,
    method: "post",
    headers: {
        Authorization: `token ${apiKey}`
    },
    data: {
        login: {
            username: username
        },
        query: `
        {
          user(login: "${username}") {
            contributionsCollection {
              totalCommitContributions
            }
            repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
              totalCount
            }
            pullRequests(first: 1) {
              totalCount
            }
            openIssues: issues(states: OPEN) {
              totalCount
            }
            closedIssues: issues(states: CLOSED) {
              totalCount
            }
            followers {
              totalCount
            }
            repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}) {
              totalCount
              nodes {
                stargazers {
                  totalCount
                }
              }
            }
          }
        }
        `
    }
}).then((res) => {
    const user = res.data.data.user;

    const totalStars = user.repositories.nodes.map((val) => val.stargazers.totalCount).reduce((partialSum, a) => partialSum + a, 0);
    const totalCommits = user.contributionsCollection.totalCommitContributions;
    const totalPRs = user.pullRequests.totalCount;
    const totalIssues = user.openIssues.totalCount + user.closedIssues.totalCount;
    const contributedTo = user.repositoriesContributedTo.totalCount;
    const followers = user.followers.totalCount;
    
    console.log("API response received");

    // require("./index2")({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers });
    section2({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers });
}).catch((err) => {
    console.log("Error!");
    console.error(err);
});
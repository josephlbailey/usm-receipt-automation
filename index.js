const puppeteer = require('puppeteer');
const fs = require('fs');
const userAgent = require('user-agents');
const nodemailer = require('nodemailer');
require('dotenv').config();

let spotifyScreenshotPath = '';
let disneyPlusScreenshotPath = '';
let spotifyScreenshotFilename = '';
let disneyPlusScreenshotFilename = '';

let spotifyUid = process.env.SPTFY_UID;
let spotifyPwd = process.env.SPTFY_PWD;
let disneyUid = process.env.DSNY_UID;
let disneyPwd = process.env.DSNY_PWD;
let outlookUid = process.env.OUTLK_UID;
let outlookPwd = process.env.OUTLK_PWD;
let verifAddr = process.env.VERIF_ADDR;
let outlookFrm = process.env.OUTLK_FRM;
let nums = process.env.NUMS;
let num1 = nums.split(',')[0];
let num2 = nums.split(',')[1];
let dryRun = false;

function setUp() {
    dryRun = process.argv.indexOf('--dry-run') !== -1;

    fs.mkdir('screenshots', (err) => {
        if (err) {
            if (err.code === 'EEXIST') {
                return;
            }

            throw err;
        }
    });
}


async function getSpotifyReceipt() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());
    page.setViewport({ width: 1200, height: 1000 });
    await page.goto('https://accounts.spotify.com/en/login/?_locale=en-US&continue=https:%2F%2Fwww.spotify.com%2Fus%2Faccount%2Fsubscription%2Freceipt%2F');
    await page.waitForSelector('#login-button');
    await page.type('#login-username', spotifyUid);
    await page.type('#login-password', spotifyPwd);
    await page.click('#login-button');
    await page.waitForSelector('#table-receipts > tbody > tr:nth-child(1)');
    await page.click('#table-receipts > tbody > tr:nth-child(1) > td.receipt-action > a');
    await page.waitForSelector('body > div.wrap > div.outer-content-wrapper > div.content-wrapper > div > div > div.col-sm-9 > div > div');
    const receipt = await page.$('body > div.wrap > div.outer-content-wrapper > div.content-wrapper > div > div > div.col-sm-9 > div > div');

    spotifyScreenshotFilename = `spotify_screenshot_${Math.floor(Date.now() / 1000)}.png`;
    spotifyScreenshotPath = `./screenshots/${spotifyScreenshotFilename}`;

    await receipt.screenshot({ path: spotifyScreenshotPath });

    await browser.close();
}

async function getDisneyReceipt() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());
    page.setViewport({ width: 1200, height: 1000 });
    await page.goto('https://disneyplus.com/login');
    await page.waitForSelector('#email');
    await page.type('#email', disneyUid);
    await page.click('#dssLogin > div:nth-child(3) > button');
    await page.waitForSelector('#password');
    await page.type('#password', disneyPwd);
    await page.click('#dssLogin > div > button');
    await page.waitForSelector('#remove-main-padding_index > div > div > section > ul > div:nth-child(1) > div > div');
    await page.click('#remove-main-padding_index > div > div > section > ul > div:nth-child(1) > div > div');
    await page.waitForSelector('#active-profile > div > div');
    await page.hover('#active-profile > div > div');
    await page.click('#dropdown-option_account > a');
    await page.waitForSelector('[data-testid="billing-history-link"]');
    await page.click('[data-testid="billing-history-link"]');
    await page.waitForSelector('[data-testid*="invoice-link-"]');
    await page.click('[data-testid*="invoice-link-"]');
    await page.waitForSelector('[data-gv2containerkey="modalContainer"] > div');
    let receipt = await page.$('[data-gv2containerkey="modalContainer"] > div');
    disneyPlusScreenshotFilename = `disney_plus_screenshot_${Math.floor(Date.now() / 1000)}.png`;
    disneyPlusScreenshotPath = `./screenshots/${disneyPlusScreenshotFilename}`;
    await receipt.screenshot({ path: disneyPlusScreenshotPath });
    await browser.close();
}

async function main() {
    try {
        setUp();
        await getDisneyReceipt();
        await getSpotifyReceipt();
    }
    catch (error) {
        await handleError(error);
        throw error;
    }

    let emailBody = fs.readFileSync('email_body.html').toString();
    emailBody = emailBody.replace('[[NUM1]]', num1);
    emailBody = emailBody.replace('[[NUM2]]', num2);
    emailBody = emailBody.replace('[[OUTLK_FRM]]', outlookFrm);

    let mailOptions = {
        from: `"${outlookFrm}" <${outlookUid}>`,
        to: verifAddr,
        bcc: [
            outlookUid
        ],
        subject: 'Disney Plus and Spotify Premium perk verification',
        html: emailBody,
        attachments: [
            {
                filename: spotifyScreenshotFilename,
                content: fs.createReadStream(spotifyScreenshotPath)
            },
            {
                filename: disneyPlusScreenshotFilename,
                content: fs.createReadStream(disneyPlusScreenshotPath)
            }
        ]
    }

    await sendEmail(mailOptions)
    
}

async function handleError(error) {
    let mailOptions = {
        from: `"${outlookFrm}" <${outlookUid}>`,
        to: outlookUid,
        subject: 'US Mobile verification failure',
        html: `Error getting receipts for verification. Error: ${error}`
    }
    
    await sendEmail(mailOptions)
}

async function sendEmail(mailOptions) {
    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        secure: false,
        port: 587,
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: outlookUid,
            pass: outlookPwd
        }
    });

    if (!dryRun) {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }

            console.log(`Message sent: ${info.response}`);
        });
    }
    else {
        console.log('********************* Dry Run *******************');
        console.log('Here\'s what would have been sent: ');
        console.log('transport options: ');
        transporter.options.auth.pass = '********************'
        console.log(transporter.options);
        console.log('mailOptions');
        console.log(mailOptions);
    }
}

main().catch(console.error);
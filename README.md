# What is this project? 

US Mobile offers "Perk" discounts for customers using autopay. These perks include free subcriptions to streaming services. I have multiple family members on my plan, so I qualify for 2 "free" streaming subscriptions. The drawback to this is that US Mobile "pays" for these subscriptions via a discount on your plan. They require a screenshot of each receipt each month emailed to their validation mailbox. Enter this project. I figured why waste 5 minutes of my time each month when I can spend 15 hours writing an extremely brittle, rigid, and poorly coded project to automatically grab a screenshot of each receipt and email it to US Mobile.

This project currently only supports Spotify __AND__ Disney Plus, as those are the two streaming services I use. Perhaps in the future when I have another peak in the waves of my motivation, I'll add support for the other services. Oh yeah, this project requires that you have an outlook mailbox to send these emails from. I think you'll have to have that mailbox set up as the primary email on your US Mobile account as well for them to accept the screenshots and apply them to your account.

You'll have to provide a [dotenv](https://nodejs.dev/learn/how-to-read-environment-variables-from-nodejs) file in the project root with your creds. That file will have to look like this: 

``` bash
# spotify
SPTFY_UID="your_spotify_uid"
SPTFY_PWD="your_spotify_password"

# disney
DSNY_UID="your_disney_uid"
DSNY_PWD="your_disney_password"

# outlook
OUTLK_UID="you@outlook.com"
OUTLK_PWD="your_outlook_password"

# "from" name that goes into nodemailer and email template
OUTLK_FRM="Your Name"

# numbers that go in the email template
NUMS="123-456-7890,234-567-8901"

# email address to send the verification emails to
VERIF_ADDR="verification_address@somedomain.com"
```

Also, this uses MS Edge headless, but you can remove the `executablePath` property in the puppeteer launch config if you want to use chromium.

This project uses the userAgent package to help with logging into Spotify.

## How to run
1. Make sure you have your `.env` file in the root of the project. 
2. Run the npm script: `npm run mainTask`

You can also do a dry-run to make sure everything works properly without actually sending the email. This will print out the nodemailer transport options and the mail options that have been configured. You can do this by passing the `--dry-run` option like this: 

`npm run mainTask -- --dry-run`

Note: no-one in their right mind should use this unless you have the *exact* scenario I have: 
- At least 4 lines with US Mobile on autopay
- Have Spotify Premium Family
- Have Disney Plus (Hulu, ESPN, Disney bundle plan thingy)
- Have a desire to waste your time